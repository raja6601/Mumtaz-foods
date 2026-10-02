import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  item_name: z.string().min(1).max(160),
  quantity: z.number().int().min(1).max(50),
  special_instructions: z.string().max(400).nullable().optional(),
  options: z
    .array(z.object({ name: z.string().max(120), extra_price: z.number().min(0).max(100000) }))
    .max(20)
    .default([]),
});

const placeOrderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  order_type: z.enum(["delivery", "pickup"]),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  area: z.string().trim().max(160).optional().or(z.literal("")),
  landmark: z.string().trim().max(160).optional().or(z.literal("")),
  notes: z.string().trim().max(600).optional().or(z.literal("")),
  payment_method: z.enum(["cash", "bank_transfer"]),
  coupon_code: z.string().trim().max(40).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1).max(60),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export type PlacedOrder = {
  order_number: string;
  customer_name: string;
  phone: string;
  order_type: string;
  address: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: string;
  prep_time_minutes: number;
  has_unpriced_items: boolean;
  items: { item_name: string; quantity: number; unit_price: number | null }[];
};

/** Creates an order. Prices are recalculated on the server from the database. */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => placeOrderSchema.parse(data))
  .handler(async ({ data }): Promise<PlacedOrder> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.order_type === "delivery" && !data.address?.trim()) {
      throw new Error("A delivery address is required for delivery orders.");
    }

    const settingsRes = await supabaseAdmin
      .from("restaurant_settings")
      .select("delivery_fee, min_order, prep_time_minutes")
      .limit(1)
      .maybeSingle();
    const settings = settingsRes.data ?? {
      delivery_fee: 0,
      min_order: 0,
      prep_time_minutes: 30,
    };

    const productIds = data.items.map((i) => i.product_id).filter(Boolean) as string[];
    const dealIds = data.items.map((i) => i.deal_id).filter(Boolean) as string[];

    const [products, deals] = await Promise.all([
      productIds.length
        ? supabaseAdmin.from("products").select("id, name, price, is_available").in("id", productIds)
        : Promise.resolve({ data: [] as any[] }),
      dealIds.length
        ? supabaseAdmin.from("deals").select("id, name, deal_price, is_active").in("id", dealIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const productMap = new Map((products.data ?? []).map((p: any) => [p.id, p]));
    const dealMap = new Map((deals.data ?? []).map((d: any) => [d.id, d]));

    let subtotal = 0;
    let hasUnpriced = false;

    const resolved = data.items.map((item) => {
      const product = item.product_id ? productMap.get(item.product_id) : null;
      const deal = item.deal_id ? dealMap.get(item.deal_id) : null;
      if (product && product.is_available === false) {
        throw new Error(`${product.name} is currently unavailable.`);
      }
      const base: number | null =
        product?.price !== undefined && product?.price !== null
          ? Number(product.price)
          : deal?.deal_price !== undefined && deal?.deal_price !== null
            ? Number(deal.deal_price)
            : null;
      const extras = (item.options ?? []).reduce((sum, o) => sum + Number(o.extra_price || 0), 0);
      const unit = base === null ? null : base + extras;
      if (unit === null) hasUnpriced = true;
      else subtotal += unit * item.quantity;

      return {
        product_id: item.product_id ?? null,
        deal_id: item.deal_id ?? null,
        item_name: product?.name ?? deal?.name ?? item.item_name,
        quantity: item.quantity,
        unit_price: unit,
        options: item.options ?? [],
        special_instructions: item.special_instructions ?? null,
      };
    });

    // Coupon
    let discount = 0;
    let appliedCoupon: string | null = null;
    const code = data.coupon_code?.trim().toUpperCase();
    if (code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      const valid =
        coupon &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (!coupon.usage_limit || coupon.times_used < coupon.usage_limit) &&
        subtotal >= Number(coupon.min_order ?? 0);
      if (!valid) throw new Error("That coupon code is not valid for this order.");
      discount =
        coupon.discount_type === "percentage"
          ? (subtotal * Number(coupon.discount_value)) / 100
          : Number(coupon.discount_value);
      if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
      discount = Math.min(discount, subtotal);
      appliedCoupon = code;
      await supabaseAdmin
        .from("coupons")
        .update({ times_used: coupon.times_used + 1 })
        .eq("id", coupon.id);
    }

    const deliveryFee =
      data.order_type === "delivery" ? Number(settings.delivery_fee ?? 0) : 0;
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        order_type: data.order_type,
        address: data.order_type === "delivery" ? data.address || null : null,
        area: data.area || null,
        landmark: data.landmark || null,
        notes: data.notes || null,
        payment_method: data.payment_method,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        coupon_code: appliedCoupon,
        status: "received",
      })
      .select("*")
      .single();

    if (error || !order) throw new Error("We couldn't save your order. Please try again.");

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(resolved.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw new Error("We couldn't save your order items. Please try again.");

    return {
      order_number: order.order_number,
      customer_name: order.customer_name,
      phone: order.phone,
      order_type: order.order_type,
      address: order.address,
      subtotal: Number(order.subtotal),
      delivery_fee: Number(order.delivery_fee),
      discount: Number(order.discount),
      total: Number(order.total),
      status: order.status,
      prep_time_minutes: Number(settings.prep_time_minutes ?? 30),
      has_unpriced_items: hasUnpriced,
      items: resolved.map((i) => ({
        item_name: i.item_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    };
  });

/** Order lookup for tracking — requires the order number AND the phone used. */
export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        order_number: z.string().trim().min(3).max(40),
        phone: z.string().trim().min(5).max(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const digits = data.phone.replace(/[^\d]/g, "").slice(-9);

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, phone, order_type, status, total, created_at")
      .eq("order_number", data.order_number.trim().toUpperCase())
      .maybeSingle();

    if (!order || !order.phone.replace(/[^\d]/g, "").endsWith(digits)) {
      return { found: false as const };
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("item_name, quantity, unit_price")
      .eq("order_id", order.id);

    return {
      found: true as const,
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        order_type: order.order_type,
        status: order.status,
        total: Number(order.total),
        created_at: order.created_at,
      },
      items: items ?? [],
    };
  });
