import { Types } from "mongoose";

export type FOLLOW_STATUS = 'pending' | 'accepted' | 'blocked';

export interface IFollow {
    followerId: Types.ObjectId;
    followingId: Types.ObjectId;
    status: FOLLOW_STATUS;
    createdAt: Date;
}