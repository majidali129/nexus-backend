import { Types } from "mongoose";


export interface ILike {
    resourceType: 'post' | 'comment' | 'story';
    resourceId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
}