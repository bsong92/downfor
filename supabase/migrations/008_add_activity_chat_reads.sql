CREATE TABLE IF NOT EXISTS activity_chat_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_chat_reads_activity_id ON activity_chat_reads(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_chat_reads_profile_id ON activity_chat_reads(profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_chat_reads_last_read_at ON activity_chat_reads(last_read_at DESC);

ALTER TABLE activity_chat_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own chat reads" ON activity_chat_reads
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can create their own chat reads" ON activity_chat_reads
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update their own chat reads" ON activity_chat_reads
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete their own chat reads" ON activity_chat_reads
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
