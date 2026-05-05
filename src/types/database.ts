export type Profile = {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  photo_url: string | null;
  bio: string | null;
  interests: string[];
  public_profile: boolean;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  poster_id: string;
  category: string;
  title: string;
  description: string | null;
  activity_date: string;
  location: string;
  spots_available: number;
  status: "active" | "cancelled" | "full";
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type JoinRequest = {
  id: string;
  activity_id: string;
  requester_id: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
  updated_at: string;
};

export const CATEGORIES = [
  "workout",
  "golf",
  "concerts",
  "climbing",
  "movies",
  "food",
  "sports",
  "study",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];
