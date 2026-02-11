import mongoose, { HydratedDocument, Schema, model } from "mongoose";
import { IPost, POST_TYPE, POST_VISIBILITY } from "../types/post";
// import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export type PostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<PostDocument>(
  {
    caption: {
      type: String,
      required: [true, "Caption is required"],
      trim: true,
      minlength: [1, "Caption cannot be empty"],
      maxlength: [5000, "Caption cannot exceed 5000 characters"],
    },
    media: {
      type: String,
      trim: true,
      required: [true, "Media URL is required"],
    },
    type: {
      type: String,
      enum: {
        values: Object.values(POST_TYPE),
        message: `Type must be one of: ${Object.values(POST_TYPE).join(", ")}`,
      },
      required: [true, "Post type is required"],
    },
    visibility: {
      type: String,
      enum: {
        values: Object.values(POST_VISIBILITY),
        message: `Visibility must be one of: ${Object.values(POST_VISIBILITY).join(", ")}`,
      },
      default: POST_VISIBILITY.PUBLIC,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },
    hashtags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 30,
        message: "Maximum 30 hashtags allowed",
      },
    },
    feelings: {
      type: [String],
      enum: {
        values: ["happy", "sad", "angry", "excited", "neutral"],
        message: "Invalid feeling type",
      },
      default: [],
    },
    taggedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: [0, "Likes count cannot be negative"],
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, "Comments count cannot be negative"],
    },
    bookmarksCount: {
      type: Number,
      default: 0,
      min: [0, "Bookmarks count cannot be negative"],
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: [0, "Shares count cannot be negative"],
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: [0, "Views count cannot be negative"],
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportsCount: {
      type: Number,
      default: 0,
      min: [0, "Reports count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// postSchema.plugin(aggregatePaginate);

export const Post =
  (mongoose.models?.Post as mongoose.Model<PostDocument>) ||
  model<PostDocument>("Post", postSchema);
