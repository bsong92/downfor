-- Allow users to delete only the messages they sent
CREATE POLICY "Senders can delete their own activity messages" ON activity_messages
  FOR DELETE USING (
    sender_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
