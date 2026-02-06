import { FOLLOW_STATUS, IFollow } from "@/types/follow";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";


type FollowDocument = HydratedDocument<IFollow>;

const followSchema = new Schema<FollowDocument>({
    followerId: {
        type: Types.ObjectId,
        required: [true, "Follower ID is required"],
        ref: "User",
        index: true,
    },
    followingId: {
        type: Types.ObjectId,
        required: [true, "Following ID is required"],
        ref: "User",
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: [FOLLOW_STATUS.PENDING, FOLLOW_STATUS.ACCEPTED, FOLLOW_STATUS.BLOCKED],
            message: "Invalid follow status. It must be 'pending', 'accepted', or 'blocked'."
        },
        default: FOLLOW_STATUS.PENDING
    }
},
    { timestamps: true }
);

export const Follow = (mongoose.models?.Follow as mongoose.Model<FollowDocument>) || mongoose.model<FollowDocument>("Follow", followSchema);