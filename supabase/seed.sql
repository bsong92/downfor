-- Seed mock profiles
INSERT INTO profiles (id, clerk_user_id, name, email, interests)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_mock_001', 'Brian Song',  'bsong92@gmail.com', ARRAY['golf','concerts','workout']),
  ('00000000-0000-0000-0000-000000000002', 'user_mock_002', 'Jane Doe',    'jane@example.com',  ARRAY['climbing','movies','food'])
ON CONFLICT (id) DO NOTHING;

-- Seed mock activities
INSERT INTO activities (id, poster_id, category, title, description, activity_date, location, spots_available)
VALUES
  ('00000000-0000-0001-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'golf',     '9 holes at Jackson Park Saturday',       'Looking for a 3rd for a casual round. Walking only, easy pace.',          '2026-05-03T10:00:00Z', 'Jackson Park Golf Course',        1),
  ('00000000-0000-0001-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'movies',   'Catching the new Sinners movie tonight', 'Going to the 7pm showing at AMC River East. Anyone want to join?',        '2026-04-28T19:00:00Z', 'AMC River East 21',               2),
  ('00000000-0000-0001-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'workout',  'Morning run along the lakefront',        '5 miles, easy pace, meeting at 57th St beach. All paces welcome.',        '2026-04-30T07:00:00Z', '57th Street Beach',               3),
  ('00000000-0000-0001-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'climbing', 'Bouldering session at Brooklyn Boulders','Intermediate level, going after work Friday. Happy to show the basics.',  '2026-05-02T18:00:00Z', 'Brooklyn Boulders Chicago',       2),
  ('00000000-0000-0001-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'food',     'Trying that new ramen spot on Michigan', 'Heard great things. Thinking Saturday lunch around noon.',                '2026-05-03T12:00:00Z', 'Ramen Misoya Chicago',            3),
  ('00000000-0000-0001-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'concerts', 'Outdoor concert at Millennium Park',     'Grant Park Orchestra playing Sunday evening. Free, bring a blanket.',     '2026-05-04T18:30:00Z', 'Jay Pritzker Pavilion',           4)
ON CONFLICT (id) DO NOTHING;
