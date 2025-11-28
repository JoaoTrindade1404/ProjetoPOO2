-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games policies - public read
CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT
  USING (true);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Create library_items table
CREATE TABLE public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  play_time INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  installed BOOLEAN DEFAULT false,
  achievements INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS on library_items
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Library items policies
CREATE POLICY "Users can view own library items"
  ON public.library_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own library items"
  ON public.library_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library items"
  ON public.library_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();