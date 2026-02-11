import { INotification } from "@/types/notification";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";

type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipientId: {
      type: Types.ObjectId,
      required: [true, "Recipient ID is required"],
      ref: "User",
      index: true,
    },
    senderId: {
      type: Types.ObjectId,
      required: [true, "Sender ID is required"],
      ref: "User",
    },
    type: {
      type: String,
      enum: {
        values: ["like", "comment", "follow", "mention", "system", "share", "story_view", "tag"],
        message:
          "Invalid notification type. Allowed types are like, comment, follow, mention, system, share, story_view, tag",
      },
      required: [true, "Notification type is required"],
    },
    content: {
      type: String,
      required: [true, "Notification content is required"],
    },
    link: {
      type: String,
      default: null,
    },
    entityType: {
      type: String,
      enum: {
        values: ["post", "comment", "story", "message", "user"],
        message: "Invalid entity type. Allowed types are post, comment, story, message, user",
      },
      required: [true, "Entity type is required"],
    },
    entityId: {
      type: Types.ObjectId,
      required: [true, "Entity ID is required"],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification =
  (mongoose.models?.Notification as mongoose.Model<NotificationDocument>) ||
  mongoose.model<NotificationDocument>("Notification", notificationSchema);
