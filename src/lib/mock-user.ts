import { Profile } from "@/types/database";

export const MOCK_USER: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  clerk_user_id: "user_mock_001",
  name: "Brian Song",
  email: "bsong92@gmail.com",
  photo_url: "https://via.placeholder.com/150",
  interests: ["golf", "concerts", "workout"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_OTHER_USER: Profile = {
  id: "00000000-0000-0000-0000-000000000002",
  clerk_user_id: "user_mock_002",
  name: "Jane Doe",
  email: "jane@example.com",
  photo_url: "https://via.placeholder.com/150",
  interests: ["climbing", "movies", "food"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
