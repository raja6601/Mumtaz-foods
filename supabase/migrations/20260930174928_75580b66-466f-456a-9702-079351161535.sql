-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  price numeric(10,2),
  is_vegetarian boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_placeholder boolean NOT NULL DEFAULT false,
  spice_level text,
  serving_size text,
  keywords text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCT OPTIONS
CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  group_name text NOT NULL DEFAULT 'Add-ons',
  name text NOT NULL,
  extra_price numeric(10,2) NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_options TO authenticated;
GRANT ALL ON public.product_options TO service_role;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view product options" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Admins manage product options" ON public.product_options FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DEALS
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  includes text,
  image_url text,
  original_price numeric(10,2),
  deal_price numeric(10,2),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.deals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active deals" ON public.deals FOR SELECT USING (is_active);
CREATE POLICY "Admins manage deals" ON public.deals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER deals_updated BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORDERS
CREATE SEQUENCE public.order_number_seq START 1001;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('MF-' || nextval('public.order_number_seq')::text),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  order_type text NOT NULL DEFAULT 'delivery',
  address text,
  area text,
  landmark text,
  notes text,
  payment_method text NOT NULL DEFAULT 'cash',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view orders" ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  special_instructions text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view order items" ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- OPENING HOURS
CREATE TABLE public.opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL UNIQUE,
  opens_at time,
  closes_at time,
  is_closed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opening_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opening_hours TO authenticated;
GRANT ALL ON public.opening_hours TO service_role;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view opening hours" ON public.opening_hours FOR SELECT USING (true);
CREATE POLICY "Admins manage opening hours" ON public.opening_hours FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SETTINGS
CREATE TABLE public.restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'Mumtaz Foods',
  tagline text,
  about_text text,
  phone text,
  whatsapp text,
  email text,
  address text,
  maps_url text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  tax_percent numeric(5,2) NOT NULL DEFAULT 0,
  prep_time_minutes integer NOT NULL DEFAULT 30,
  accepts_online_payment boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurant_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.restaurant_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELIVERY ZONES
CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  eta_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.delivery_zones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_zones TO authenticated;
GRANT ALL ON public.delivery_zones TO service_role;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active zones" ON public.delivery_zones FOR SELECT USING (is_active);
CREATE POLICY "Admins manage zones" ON public.delivery_zones FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COUPONS
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  max_discount numeric(10,2),
  expires_at timestamptz,
  usage_limit integer,
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GALLERY
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  category text NOT NULL DEFAULT 'Food',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (is_active);
CREATE POLICY "Admins manage gallery" ON public.gallery FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SEED
INSERT INTO public.restaurant_settings (tagline, phone, address, maps_url, prep_time_minutes)
VALUES ('Authentic Taste. Made Fresh.', '+92 51 5181635',
        'Shop A-305, Dhok Hasu Road, Hafizabad, Westridge, Rawalpindi, Punjab, Pakistan',
        'https://maps.google.com/?q=Mumtaz+Foods+Dhok+Hasu+Road+Westridge+Rawalpindi', 30);

INSERT INTO public.opening_hours (day_of_week, opens_at, closes_at, is_closed) VALUES
(1, '11:00', '23:00', false),
(2, '11:00', '23:00', false),
(3, '11:00', '23:00', false),
(4, '11:00', '23:00', false),
(5, '11:00', '23:00', false),
(6, '11:00', '23:00', false),
(0, '11:00', '23:00', false);

INSERT INTO public.categories (name, slug, sort_order) VALUES
('Pulao & Rice', 'pulao-rice', 1),
('Kababs', 'kababs', 2),
('Chicken', 'chicken', 3),
('Mutton', 'mutton', 4),
('Breads', 'breads', 5),
('Sides', 'sides', 6),
('Salads', 'salads', 7),
('Drinks', 'drinks', 8),
('Desserts', 'desserts', 9);

INSERT INTO public.products (category_id, name, slug, description, is_placeholder, is_featured, is_vegetarian, keywords, sort_order)
SELECT c.id, v.name, v.slug, v.description, true, v.featured, v.veg, v.keywords, v.ord
FROM (VALUES
  ('pulao-rice', 'Chicken Pulao', 'chicken-pulao', 'Sample item — replace name, description, photo and price in the admin panel.', true, false, 'chicken rice pulao', 1),
  ('pulao-rice', 'Mutton Pulao', 'mutton-pulao', 'Sample item — replace name, description, photo and price in the admin panel.', true, false, 'mutton rice pulao', 2),
  ('kababs', 'Seekh Kabab', 'seekh-kabab', 'Sample item — replace name, description, photo and price in the admin panel.', true, false, 'kabab beef bbq', 1),
  ('kababs', 'Shami Kabab', 'shami-kabab', 'Sample item — replace name, description, photo and price in the admin panel.', false, false, 'kabab beef', 2),
  ('chicken', 'Chicken Karahi', 'chicken-karahi', 'Sample item — replace name, description, photo and price in the admin panel.', true, false, 'chicken karahi curry', 1),
  ('mutton', 'Mutton Karahi', 'mutton-karahi', 'Sample item — replace name, description, photo and price in the admin panel.', false, false, 'mutton karahi curry', 1),
  ('breads', 'Naan', 'naan', 'Sample item — replace name, description, photo and price in the admin panel.', false, true, 'naan roti bread', 1),
  ('sides', 'Raita', 'raita', 'Sample item — replace name, description, photo and price in the admin panel.', false, true, 'raita yogurt side', 1),
  ('salads', 'Fresh Salad', 'fresh-salad', 'Sample item — replace name, description, photo and price in the admin panel.', false, true, 'salad fresh', 1),
  ('drinks', 'Soft Drink', 'soft-drink', 'Sample item — replace name, description, photo and price in the admin panel.', false, true, 'drink cold', 1),
  ('desserts', 'Kheer', 'kheer', 'Sample item — replace name, description, photo and price in the admin panel.', false, true, 'dessert sweet kheer', 1)
) AS v(cat, name, slug, description, featured, veg, keywords, ord)
JOIN public.categories c ON c.slug = v.cat;