import { Types } from "mongoose";

// 'pending' | 'accepted' | 'blocked';

export enum FOLLOW_STATUS {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export interface IFollow {
    followerId: Types.ObjectId; // the user who follows
    followingId: Types.ObjectId; // the user being followed
    status: FOLLOW_STATUS;
    createdAt: Date;
}

export interface FollowContext {
    currentUserId: string;
    currentUsername: string;
    targetUsername?: string; // for sending follow requests
    followReqId?: string; // for responding to follow requests
}