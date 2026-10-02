export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductOption = {
  id: string;
  product_id: string;
  group_name: string;
  name: string;
  extra_price: number;
  is_required: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  is_vegetarian: boolean;
  is_available: boolean;
  is_featured: boolean;
  is_placeholder: boolean;
  spice_level: string | null;
  serving_size: string | null;
  keywords: string | null;
  sort_order: number;
};

export type Deal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  includes: string | null;
  image_url: string | null;
  original_price: number | null;
  deal_price: number | null;
  is_active: boolean;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  category: string;
  sort_order: number;
};

export type DeliveryZone = {
  id: string;
  name: string;
  delivery_fee: number;
  min_order: number;
  eta_minutes: number | null;
};

export type RestaurantSettings = {
  id: string;
  brand_name: string;
  tagline: string | null;
  about_text: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  delivery_fee: number;
  min_order: number;
  tax_percent: number;
  prep_time_minutes: number;
  accepts_online_payment: boolean;
};
