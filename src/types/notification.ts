import { Types } from "mongoose";
import { USER_ROLE } from "./user";

export enum NotificationType {
    LIKE = 'like',
    COMMENT = 'comment',
    FOLLOW = 'follow',
    MENTION = 'mention',
    SYSTEM = 'system',
    SHARE = 'share',
    STORY_VIEW = 'story_view',
    TAG = 'tag'
}

export interface INotification {
    recipientId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: NotificationType;
    content: string;
    link?: string;
    entityType: 'user' | 'post' | 'comment' | 'story' | 'message';
    entityId: Types.ObjectId;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationContext {
    currentUserId: Types.ObjectId;
    currentUserRole: USER_ROLE;
    notificationId?: Types.ObjectId;
}