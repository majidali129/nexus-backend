import { Types } from "mongoose";

// 'pending' | 'accepted' | 'blocked';

export enum FOLLOW_STATUS {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    BLOCKED = 'blocked'
}

export interface IFollow {
    followerId: Types.ObjectId; // the user who follows
    followingId: Types.ObjectId; // the user being followed
    status: FOLLOW_STATUS;
    createdAt: Date;
}