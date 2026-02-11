import { NotificationType } from "@/types/notification";
import { Types } from "mongoose";

export interface BaseEvent {
  timestamp: number;
  eventId: string;
}

// ------------ POST EVENTS ----------
export interface PostLikedEvent extends BaseEvent {
  postId: Types.ObjectId;
  postAuthorId: Types.ObjectId;
  likedByUserId: Types.ObjectId;
  likedByUsername: string;
}

export interface PostDeletedEvent extends BaseEvent {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
}

// ------- COMMENT EVENTS -------

export interface CommentCreatedEvent extends BaseEvent {
  commentId: Types.ObjectId;
  postId: Types.ObjectId;
  postAuthorId: Types.ObjectId;
  commentAuthorId: Types.ObjectId;
  commentAuthorUsername: string;
  content: string;
}

export interface CommentRepliedEvent extends BaseEvent {
  replyId: Types.ObjectId;
  parentCommentId: Types.ObjectId;
  parentCommentAuthorId: Types.ObjectId;
  postId: Types.ObjectId;
  replyAuthorId: Types.ObjectId;
  replyAuthorUsername: string;
  content: string;
}

// ========== FOLLOW EVENTS ==========

export interface UserFollowedReqEvent extends BaseEvent {
  followerId: Types.ObjectId;
  followerUsername: string;
  followedUserId: Types.ObjectId;
}

export interface FollowAcceptedEvent extends BaseEvent {
  followerId: Types.ObjectId;
  followedUserId: Types.ObjectId;
  followedUsername: string;
}

// ========== NOTIFICATION EVENTS ==========

export interface NotificationCreatedEvent extends BaseEvent {
  notificationId: Types.ObjectId;
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderUsername: string;
  senderProfilePhoto?: string;
  type: NotificationType;
  content: string;
  link?: string;
  entityType: "post" | "comment" | "story" | "message" | "user";
  entityId: Types.ObjectId;
}

// ========== EVENT PAYLOAD UNION TYPE ==========

export type EventPayload =
  | PostLikedEvent
  | PostDeletedEvent
  | CommentCreatedEvent
  | CommentRepliedEvent
  | UserFollowedReqEvent
  | FollowAcceptedEvent
  | NotificationCreatedEvent;
