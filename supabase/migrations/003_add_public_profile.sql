-- Add public_profile field to profiles (default true for visible in members list)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE;
