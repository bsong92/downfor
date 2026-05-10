# Smoke Tests

Run these after meaningful changes.

## Auth

- Open the app with Clerk enabled.
- Sign in and confirm the app loads your profile.
- Open `/profile` and confirm your name, email, and public settings render.

## Posting

- Create an activity with a title, date, time, location, and spot count.
- Confirm it appears in `/feed`.
- Open the activity detail page and confirm the data matches what you entered.

## Requests

- Request to join an activity.
- Approve, decline, and reopen a declined request from the host side.
- Confirm the counts on the requests page update.

## Weather

- Create or edit an outdoor activity within the forecast window.
- Confirm weather appears on the feed and activity detail page.

## Chat

- Approve at least one attendee for an activity.
- Open the chat from the activity card or detail page.
- Send a message, attach a photo, and delete your own message.

## Calendar

- Open `/calendar`.
- Confirm activities appear in the grid and the schedule list.
