import { IComment } from "@/types/comment";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";


export type CommentDocument = HydratedDocument<IComment>;

const commentSchema = new Schema<CommentDocument>({
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        maxlength: [1000, "Content cannot exceed 1000 characters"]
    },
    postId: {
        type: Types.ObjectId,
        required: [true, "Post ID is required"],
        ref: "Post",
        index: true,
    },
    authorId: {
        type: Types.ObjectId,
        required: [true, "Author ID is required"],
        ref: "User"
        , index: true
    },
    likesCount: {
        type: Number,
        default: 0,
        min: [0, "Likes count cannot be negative"]
    },
    parentCommentId: {
        type: Types.ObjectId,
        default: null,
        ref: 'Comment'
    },
    repliesCount: {
        type: Number,
        default: 0,
        min: [0, 'Replies count cannot be negative']
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

export const Comment = (mongoose.models?.Comment as mongoose.Model<CommentDocument>) || mongoose.model<CommentDocument>("Comment", commentSchema);