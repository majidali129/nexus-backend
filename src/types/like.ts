import { Types } from "mongoose";
import { USER_ROLE } from "./user";


export type ResourceType = 'post' | 'comment' | 'story';

export interface ILike {
    resourceType: ResourceType;
    resourceId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
}

export interface LikeContext {
    userId: string;
    userRole: USER_ROLE;
    resourceId: string;
    resourceType: ResourceType;
}