import { Types } from "mongoose";



export interface IBookmark {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
}