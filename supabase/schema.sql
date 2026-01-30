-- Enable Row Level Security (RLS) on all tables
-- This ensures that users can only access their own data.

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_currency TEXT DEFAULT 'INR',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Markets Table (User-owned, editable)
CREATE TABLE public.markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  lot_size INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own markets" ON public.markets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own markets" ON public.markets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own markets" ON public.markets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own markets" ON public.markets
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Setups Table (User-owned, editable)
CREATE TABLE public.setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own setups" ON public.setups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own setups" ON public.setups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setups" ON public.setups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own setups" ON public.setups
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Mistakes Table (User-owned, editable)
CREATE TABLE public.mistakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mistakes" ON public.mistakes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mistakes" ON public.mistakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistakes" ON public.mistakes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mistakes" ON public.mistakes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Trades Table (Core table)
CREATE TABLE public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Trade Details
  trade_date TIMESTAMPTZ NOT NULL,
  market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
  setup_id UUID REFERENCES public.setups(id) ON DELETE SET NULL,
  mistake_id UUID REFERENCES public.mistakes(id) ON DELETE SET NULL,

  direction TEXT CHECK (direction IN ('LONG', 'SHORT')),
  trade_type TEXT CHECK (trade_type IN ('INTRADAY', 'SWING')),

  -- Pricing & Sizing
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  quantity INT NOT NULL,
  lots NUMERIC NOT NULL, -- Storing as numeric in case of fractional lots (though unlikely for indices)
  lot_size_snapshot INT NOT NULL, -- Historic lot size at time of trade

  sl_price NUMERIC,
  target_price NUMERIC,

  -- Calculated Metrics
  risk_amount NUMERIC,
  rr NUMERIC,
  gross_pnl NUMERIC NOT NULL,
  brokerage NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  pnl_after_expense NUMERIC,

  -- Psychology & Misc
  emotion TEXT,
  followed_rules BOOLEAN DEFAULT TRUE,
  time_slot TEXT, -- e.g., '09:15-10:30'
  notes TEXT,
  trade_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Storage Bucket Configuration (Instructions)
-- You must create a bucket named 'trade_images' in the Supabase Dashboard > Storage.
-- Make it public or set appropriate RLS policies.
-- Example Policy for Storage:
-- INSERT: authenticated users can upload to folder {user_id}/*
-- SELECT: authenticated users (or public) can read folder {user_id}/*

-- 7. Trigger for New User Cleanup
-- Automatically creates a profile and seeds default markets when a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := NEW.id;

  -- Create Profile
  INSERT INTO public.profiles (id)
  VALUES (new_user_id);

  -- Seed Default Markets
  INSERT INTO public.markets (user_id, name, lot_size)
  VALUES
    (new_user_id, 'NIFTY', 50),
    (new_user_id, 'BANKNIFTY', 15),
    (new_user_id, 'FINNIFTY', 40),
    (new_user_id, 'SENSEX', 10),
    (new_user_id, 'MIDCPNIFTY', 75),
    (new_user_id, 'BANKEX', 15);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
-- Note: In Supabase, you must run this in the SQL Editor.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
