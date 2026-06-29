-- Migration: Initialize schema for Antigravity (Pikaso Clone)

-- 1. Create a public users table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for user access to public.users
CREATE POLICY "Users can view and update their own profile" 
  ON public.users
  FOR ALL
  USING (auth.uid() = id);

-- Trigger to automatically create a public user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create templates table for user configurations
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout TEXT NOT NULL,
  theme TEXT NOT NULL,
  padding INTEGER NOT NULL DEFAULT 48,
  rounded INTEGER NOT NULL DEFAULT 16,
  shadow BOOLEAN NOT NULL DEFAULT TRUE,
  filled BOOLEAN NOT NULL DEFAULT TRUE,
  show_watermark BOOLEAN NOT NULL DEFAULT TRUE,
  show_metrics BOOLEAN NOT NULL DEFAULT TRUE,
  show_avatars BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
  ON public.templates
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);

-- 3. Create generations table to log user screenshots history
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tweet_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generations"
  ON public.generations
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes on generations table
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_tweet_id ON public.generations(tweet_id);

-- Enable Supabase Realtime CDC (Change Data Capture) on generations
-- This is used for WebSocket push notifications from database
ALTER PUBLICATION supabase_realtime ADD TABLE public.generations;
