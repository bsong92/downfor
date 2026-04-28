import type { Activity, JoinRequest, Profile } from "./database";

export type ActivityWithPoster = Activity & { poster: Profile };
export type JoinRequestWithRequester = JoinRequest & { requester: Profile };
