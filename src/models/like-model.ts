import { ILike } from "@/types/like";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";


type LikeDocument = HydratedDocument<ILike>;


const likeSchema = new Schema<LikeDocument>({
    resourceType: {
        type: String,
        enum: {
            values: ['post', 'comment', 'story'],
            message: "Resource type must be either 'post', 'comment', or 'story'"
        },
        required: [true, "Resource type is required"],
    },
    resourceId: {
        type: Types.ObjectId,
        required: [true, "Resource ID is required"],
        index: true,
    },
    userId: {
        type: Types.ObjectId,
        required: [true, "User ID is required"],
        ref: "User",
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});



export const Like = (mongoose.models?.Like as mongoose.Model<LikeDocument>) || mongoose.model<LikeDocument>("Like", likeSchema);