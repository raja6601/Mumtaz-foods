import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  Category,
  Deal,
  DeliveryZone,
  GalleryImage,
  Product,
  ProductOption,
  RestaurantSettings,
} from "./menu-types";
import type { OpeningHour } from "./site";

function publicClient(): SupabaseClient {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type SiteData = {
  settings: RestaurantSettings | null;
  hours: OpeningHour[];
  categories: Category[];
  products: Product[];
  options: ProductOption[];
  deals: Deal[];
  gallery: GalleryImage[];
  zones: DeliveryZone[];
};

/** Everything the public website needs, in one round trip. */
export const getSiteData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteData> => {
    const db = publicClient();
    const [settings, hours, categories, products, options, deals, gallery, zones] =
      await Promise.all([
        db.from("restaurant_settings").select("*").limit(1).maybeSingle(),
        db.from("opening_hours").select("day_of_week, opens_at, closes_at, is_closed"),
        db.from("categories").select("*").eq("is_active", true).order("sort_order"),
        db.from("products").select("*").order("sort_order"),
        db.from("product_options").select("*").order("sort_order"),
        db.from("deals").select("*").eq("is_active", true).order("sort_order"),
        db.from("gallery").select("*").order("sort_order"),
        db.from("delivery_zones").select("*").eq("is_active", true).order("sort_order"),
      ]);

    return {
      settings: (settings.data as RestaurantSettings | null) ?? null,
      hours: (hours.data as OpeningHour[]) ?? [],
      categories: (categories.data as Category[]) ?? [],
      products: (products.data as Product[]) ?? [],
      options: (options.data as ProductOption[]) ?? [],
      deals: (deals.data as Deal[]) ?? [],
      gallery: (gallery.data as GalleryImage[]) ?? [],
      zones: (zones.data as DeliveryZone[]) ?? [],
    };
  },
);
