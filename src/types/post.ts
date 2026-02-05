import { Types } from "mongoose";
import { USER_ROLE } from "./user";

export enum POST_TYPE {
    IMAGE = 'image',
    VIDEO = 'video',
    TEXT = 'text'
}

export enum POST_VISIBILITY {
    PUBLIC = 'public',
    PRIVATE = 'private',
    FRIENDS = 'friends'
}

export type FEELING = 'happy' | 'sad' | 'angry' | 'excited' | 'neutral';

export interface IPost {
    caption: string;
    media: string; // single file URL for now. Can be extended to array for multiple files
    type: POST_TYPE;
    visibility: POST_VISIBILITY;
    authorId: Types.ObjectId;
    hashtags: string[];
    feelings: FEELING[];
    taggedUsers: Types.ObjectId[];
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    sharesCount: number;
    viewsCount: number;
    isReported: boolean;
    reportsCount: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostContext {
    userId: string;
    role: USER_ROLE;
    postId?: string;
}