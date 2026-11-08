CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'UBC Student',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid,
  seller_name text NOT NULL DEFAULT 'UBC Student',
  kind text NOT NULL DEFAULT 'sell',
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  category text NOT NULL DEFAULT 'Other',
  location text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings readable" ON public.listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own listing insert" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "own listing update" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "own listing delete" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = seller_id);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "sender insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND sender_id <> recipient_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

CREATE POLICY "listing images owner read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "listing images own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.listings (seller_name, kind, title, price, original_price, category, location, description) VALUES
('Alex', 'sell', 'Desk lamp, warm LED', 8, 25, 'Dorm', 'Koerner Library', 'Works great, three brightness levels.'),
('Mei', 'sell', 'MATH 100 textbook, 9th ed.', 30, 120, 'Textbooks', 'Buchanan', 'Light highlighting in first chapters.'),
('Jordan', 'sell', 'Mini fridge, 3.1 cu ft', 60, 180, 'Appliances', 'Totem Park', 'Moving out end of April.'),
('Chris', 'sell', 'Bike lock + lights set', 15, 40, 'Bikes', 'The Nest', 'U-lock with two keys plus USB lights.'),
('Taylor', 'sell', 'Office chair, mesh back', 35, 45, 'Furniture', 'Marine Drive', 'Adjustable height.'),
('Riley', 'sell', 'Rice cooker, 6-cup', 18, 22, 'Appliances', 'Ponderosa', 'Clean, all parts included.'),
('Sam', 'rent', '24-inch monitor', 70, 90, 'Electronics', 'ICICS', 'HDMI cable included.'),
('Priya', 'wanted', 'Graphing calculator for my MATH 200 midterm', 15, NULL, 'Electronics', 'Science', 'Need by Mar 10 · rent up to $15'),
('Daniel', 'wanted', 'Winter coat, size M', 40, NULL, 'Clothing', 'Vanier', 'This week · up to $40'),
('Sam', 'wanted', 'Air mattress for visiting parents', 20, NULL, 'Dorm', 'Fairview', 'Rent Mar 20–24');