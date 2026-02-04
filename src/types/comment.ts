import { Types } from "mongoose";




export interface IComment {
    content: string;
    postId: Types.ObjectId;
    authorId: Types.ObjectId;
    likesCount: number;
    parentCommentId?: Types.ObjectId;
    repliesCount: number;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}