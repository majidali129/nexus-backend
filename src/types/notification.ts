import { Types } from "mongoose";

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
    link: string;
    entityType: 'post' | 'comment' | 'story' | 'message';
    entityId: Types.ObjectId;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}