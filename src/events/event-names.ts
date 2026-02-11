export const EVENT_NAMES = {
  // Post Events
  POST_LIKED: "post:liked",

  // Comment Events
  COMMENT_CREATED: "comment:created",
  COMMENT_REPLIED: "comment:replied",

  // Follow Events
  USER_FOLLOW_REQUEST: "user:followRequest", // emitted when a follow request is made (for private profiles)
  USER_FOLLOWED: "user:followed", // direct follow event for auto-accepted follows (public profiles)
  FOLLOW_REQUEST_ACCEPTED: "follow:accepted", // emitted when a pending follow request is accepted

  // Notification Events
  NOTIFICATION_CREATED: "notification:created",

  // Story Events
  STORY_CREATED: "story:created",
  STORY_VIEWED: "story:viewed",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
