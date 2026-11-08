ALTER TABLE public.listings ADD COLUMN drop_price numeric(10,2), ADD COLUMN drop_at timestamptz;
UPDATE public.listings SET drop_price = 28, drop_at = now() + interval '6 hours' WHERE title = 'Office chair, mesh back' AND seller_id IS NULL;
UPDATE public.listings SET drop_price = 14, drop_at = now() + interval '1 day' WHERE title = 'Rice cooker, 6-cup' AND seller_id IS NULL;
UPDATE public.listings SET drop_price = 60, drop_at = now() + interval '2 days' WHERE title = '24-inch monitor' AND seller_id IS NULL;

CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  item_count int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  description text,
  pickup text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bundles TO anon, authenticated;
GRANT ALL ON public.bundles TO service_role;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bundles readable" ON public.bundles FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.bundles (title, item_count, price, original_price, description, pickup) VALUES
('First-year dorm kit', 6, 85, 210, 'Bedding, lamp, hangers, kettle and more', 'Pickup Aug 30 · Totem Park'),
('Desk setup', 4, 120, 299, 'Monitor, keyboard, lamp, chair', 'Pickup Apr 29 · Marine Drive'),
('Kitchen starter', 9, 45, 130, 'Pots, pans, utensils, rice cooker', 'Pickup May 1 · Ponderosa');