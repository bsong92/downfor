import type { Activity, JoinRequest, Profile } from "./database";

export type ActivityWithPoster = Activity & { poster: Profile };
export type JoinRequestWithRequester = JoinRequest & { requester: Profile };

export type AttendeePreview = Pick<Profile, "id" | "name" | "photo_url">;
export type JoinRequestForAttendees = Pick<JoinRequest, "id" | "status"> & {
  requester: AttendeePreview;
};
export type ActivityWithAttendees = ActivityWithPoster & {
  join_requests: JoinRequestForAttendees[];
};
