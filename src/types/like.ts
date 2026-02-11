import { Types } from "mongoose";


export type ResourceType = 'post' | 'comment' | 'story';

export interface ILike {
    resourceType: ResourceType;
    resourceId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
}
