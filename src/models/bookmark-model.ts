import { IBookmark } from "@/types/bookmark";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";



type BookmarkDocument = HydratedDocument<IBookmark>;

const bookmarkSchema = new Schema<BookmarkDocument>({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    postId: {
        type: Types.ObjectId,
        ref: "Post",
        required: [true, "Post ID is required"],
        index: true
    }
}, {
    timestamps: true
});

export const Bookmark = (mongoose.models?.Bookmark as mongoose.Model<BookmarkDocument>) || mongoose.model<BookmarkDocument>("Bookmark", bookmarkSchema);
