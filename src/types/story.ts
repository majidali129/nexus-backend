import { Types } from "mongoose";


export enum STORY_TYPE {
    IMAGE = 'image',
    VIDEO = 'video',
}

export interface IStory {
    authorId: Types.ObjectId;
    type: STORY_TYPE;
    mediaUrl: string;
    duration: number;
    viewers: Types.ObjectId[];
    viewsCount: number;
    likesCount: number;
    expiresAt: number;
    createdAt: Date;
    updatedAt: Date;
}