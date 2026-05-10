ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_notifications_chat BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_notifications_requests BOOLEAN DEFAULT TRUE;

UPDATE profiles
SET email_notifications_chat = TRUE
WHERE email_notifications_chat IS NULL;

UPDATE profiles
SET email_notifications_requests = TRUE
WHERE email_notifications_requests IS NULL;

ALTER TABLE profiles
  ALTER COLUMN email_notifications_chat SET NOT NULL,
  ALTER COLUMN email_notifications_requests SET NOT NULL;
