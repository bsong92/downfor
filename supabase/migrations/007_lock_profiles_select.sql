-- Tighten profile reads so browser clients cannot enumerate private identity data.
-- Public profile visibility stays available; owners can still read their own rows.

ALTER TABLE profiles
  ALTER COLUMN public_profile SET DEFAULT TRUE;

UPDATE profiles
SET public_profile = TRUE
WHERE public_profile IS NULL;

ALTER TABLE profiles
  ALTER COLUMN public_profile SET NOT NULL;

DROP POLICY IF EXISTS "Profiles are readable by everyone" ON profiles;

CREATE POLICY "Public profiles are readable; owners can read own profile" ON profiles
  FOR SELECT USING (
    public_profile = TRUE
    OR clerk_user_id = auth.jwt() ->> 'sub'
  );
