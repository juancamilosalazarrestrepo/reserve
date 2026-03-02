-- Luxury San Andrés Leasing Platform - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE asset_type AS ENUM ('apartment', 'yacht');
CREATE TYPE reservation_status AS ENUM ('confirmed', 'pending', 'cancelled');

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ASSETS TABLE
-- ============================================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  description TEXT,
  location TEXT,
  capacity INTEGER DEFAULT 2,
  price_per_night NUMERIC(10,2) DEFAULT 0,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESERVATIONS TABLE
-- ============================================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status reservation_status DEFAULT 'pending',
  total_price NUMERIC(10,2) DEFAULT 0,
  guest_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Prevent overlapping reservations for the same asset
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE asset_id = NEW.asset_id
      AND id != COALESCE(NEW.id, uuid_generate_v4())
      AND status != 'cancelled'
      AND daterange(check_in, check_out, '[)') && daterange(NEW.check_in, NEW.check_out, '[)')
  ) THEN
    RAISE EXCEPTION 'This asset is already booked for the selected dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_reservation_overlap
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_reservation_overlap();

-- Auto-calculate total price
CREATE OR REPLACE FUNCTION calculate_total_price()
RETURNS TRIGGER AS $$
DECLARE
  asset_price NUMERIC;
  num_nights INTEGER;
BEGIN
  SELECT price_per_night INTO asset_price FROM assets WHERE id = NEW.asset_id;
  num_nights := NEW.check_out - NEW.check_in;
  NEW.total_price := asset_price * num_nights;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_price
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_price();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active assets"
  ON assets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all assets"
  ON assets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert assets"
  ON assets FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update assets"
  ON assets FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete assets"
  ON assets FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reservations RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own reservations"
  ON reservations FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can update any reservation"
  ON reservations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete reservations"
  ON reservations FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert sample assets
INSERT INTO assets (name, type, description, location, capacity, price_per_night, bedrooms, bathrooms, amenities, images, is_active) VALUES
(
  'Oceanfront Penthouse Suite',
  'apartment',
  'Indulge in the ultimate luxury experience at our stunning Oceanfront Penthouse Suite. Featuring panoramic floor-to-ceiling windows with breathtaking views of the Caribbean Sea, this spacious retreat combines modern elegance with tropical comfort.',
  'Playa Spratt Bight',
  6,
  450.00,
  3,
  2,
  '["Ocean View", "WiFi", "Air Conditioning", "Full Kitchen", "Private Balcony", "Parking", "Pool Access", "Concierge"]'::jsonb,
  ARRAY['/images/apt-penthouse-1.jpg', '/images/apt-penthouse-2.jpg', '/images/apt-penthouse-3.jpg'],
  true
),
(
  'Sea View Apartment',
  'apartment',
  'A charming apartment with direct sea views from every room. Located in the heart of San Luis, offering the perfect blend of tranquility and accessibility to the island attractions.',
  'San Luis',
  4,
  320.00,
  2,
  1,
  '["Sea View", "WiFi", "Air Conditioning", "Kitchenette", "Balcony", "Beach Access"]'::jsonb,
  ARRAY['/images/apt-seaview-1.jpg', '/images/apt-seaview-2.jpg'],
  true
),
(
  'Garden Paradise Villa',
  'apartment',
  'Nestled in lush tropical gardens at La Loma, this villa offers a serene escape with a private pool, outdoor dining area, and direct access to stunning nature trails.',
  'La Loma',
  8,
  380.00,
  4,
  3,
  '["Private Pool", "Garden", "WiFi", "Air Conditioning", "Full Kitchen", "BBQ Area", "Parking", "Hammocks"]'::jsonb,
  ARRAY['/images/apt-garden-1.jpg', '/images/apt-garden-2.jpg'],
  true
),
(
  'Tropical Studio',
  'apartment',
  'A cozy and stylish studio apartment perfect for couples, right in the center of the island with walking distance to the best restaurants and nightlife.',
  'Centro',
  2,
  180.00,
  1,
  1,
  '["WiFi", "Air Conditioning", "Kitchenette", "City View"]'::jsonb,
  ARRAY['/images/apt-studio-1.jpg'],
  true
),
(
  'Yacht Azzurro 50ft',
  'yacht',
  'Step aboard the magnificent Yacht Azzurro, a 50-foot luxury vessel perfect for exploring the crystal-clear waters around San Andrés. Includes professional crew and water sports equipment.',
  'Marina San Andrés',
  12,
  1200.00,
  3,
  2,
  '["Professional Crew", "Snorkeling Gear", "Jet Ski", "Sound System", "Sun Deck", "Fishing Equipment", "Gourmet Kitchen"]'::jsonb,
  ARRAY['/images/yacht-azzurro-1.jpg', '/images/yacht-azzurro-2.jpg'],
  true
),
(
  'Yacht Caribbean Star',
  'yacht',
  'The Caribbean Star is your gateway to paradise. This elegant 40-foot yacht features a spacious sun deck, premium audio system, and comes with an experienced captain for half or full-day excursions.',
  'Marina San Andrés',
  8,
  950.00,
  2,
  1,
  '["Captain Included", "Snorkeling Gear", "Sound System", "Sun Deck", "Cooler with Drinks"]'::jsonb,
  ARRAY['/images/yacht-star-1.jpg', '/images/yacht-star-2.jpg'],
  true
),
(
  'Yacht Esmeralda',
  'yacht',
  'The crown jewel of our fleet. The 65-foot Yacht Esmeralda offers unparalleled luxury with a jacuzzi on deck, a professional chef, and accommodations for overnight Caribbean adventures.',
  'Marina San Andrés',
  16,
  1500.00,
  4,
  3,
  '["Jacuzzi", "Professional Chef", "Full Crew", "Jet Ski", "Kayaks", "Premium Bar", "Master Suite", "Sound System"]'::jsonb,
  ARRAY['/images/yacht-esmeralda-1.jpg', '/images/yacht-esmeralda-2.jpg'],
  true
);

-- Create Supabase Storage bucket (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
