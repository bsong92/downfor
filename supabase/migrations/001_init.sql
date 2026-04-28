-- Profiles table (linked to Clerk user ID)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  spots_available INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'full')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Join requests table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, requester_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_poster_id ON activities(poster_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_join_requests_activity_id ON join_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_requester_id ON join_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are readable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- RLS Policies for activities
CREATE POLICY "Activities are readable by everyone" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Users can create activities" ON activities
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' IN (SELECT clerk_user_id FROM profiles WHERE id = poster_id));

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (poster_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own activities" ON activities
  FOR DELETE USING (poster_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- RLS Policies for join_requests
CREATE POLICY "Users can see join requests for their activities" ON join_requests
  FOR SELECT USING (
    activity_id IN (SELECT id FROM activities WHERE poster_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'))
    OR requester_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can create join requests" ON join_requests
  FOR INSERT WITH CHECK (requester_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Posters can update join request status" ON join_requests
  FOR UPDATE USING (
    activity_id IN (SELECT id FROM activities WHERE poster_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'))
  );
