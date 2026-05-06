import type { Activity, ActivityMessage, JoinRequest, Profile } from "./database";

export type ActivityWithPoster = Activity & { poster: Profile };
export type JoinRequestWithRequester = JoinRequest & { requester: Profile };

export type AttendeePreview = Pick<Profile, "id" | "name" | "photo_url">;
export type JoinRequestForAttendees = Pick<JoinRequest, "id" | "status"> & {
  requester: AttendeePreview;
};
export type ActivityWithAttendees = ActivityWithPoster & {
  join_requests: JoinRequestForAttendees[];
};

export type ActivityMessageWithSender = ActivityMessage & {
  sender: AttendeePreview;
};
