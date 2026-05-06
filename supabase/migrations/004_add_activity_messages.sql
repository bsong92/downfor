-- Activity chat messages for one shared thread per activity
CREATE TABLE IF NOT EXISTS activity_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_messages_activity_id ON activity_messages(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_messages_sender_id ON activity_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_activity_messages_created_at ON activity_messages(created_at DESC);

ALTER TABLE activity_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read activity messages" ON activity_messages
  FOR SELECT USING (
    activity_id IN (
      SELECT id FROM activities
      WHERE poster_id IN (
        SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
      )
      OR id IN (
        SELECT activity_id FROM join_requests
        WHERE requester_id IN (
          SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
        AND status = 'approved'
      )
    )
  );

CREATE POLICY "Participants can send activity messages" ON activity_messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
    AND (
      activity_id IN (
        SELECT id FROM activities
        WHERE poster_id IN (
          SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
      )
      OR activity_id IN (
        SELECT activity_id FROM join_requests
        WHERE requester_id IN (
          SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
        AND status = 'approved'
      )
    )
  );
