import { emitter } from "@/lib/event-bus";
import { EVENT_NAMES } from "../event-names";
import { NotificationCreatedEvent, PostLikedEvent } from "../event-types";
import { io } from "@/lib/socket";

emitter.on(EVENT_NAMES.POST_LIKED, (event: PostLikedEvent) => {
  try {
    io.to(`user:${event.postAuthorId.toString()}`).emit(
      EVENT_NAMES.POST_LIKED,
      {
        postId: event.postId,
        likedBy: {
          userId: event.likedByUserId,
          username: event.likedByUsername,
        },
        timestamp: event.timestamp,
      },
    );
  } catch (error) {
    console.error("[socket-listener] Error BROADCASTING POST_LIKED:", error);
  }
});

emitter.on(
  EVENT_NAMES.NOTIFICATION_CREATED,
  (event: NotificationCreatedEvent) => {
    try {
      io.to(`user:${event.recipientId.toString()}`).emit(
        EVENT_NAMES.NOTIFICATION_CREATED,
        {
          notificationId: event.notificationId,
          type: event.type,
          content: event.content,
          link: event.link,
          sender: {
            userId: event.senderId,
            username: event.senderUsername,
            profilePhoto: event.senderProfilePhoto,
          },
          entityType: event.entityType,
          entityId: event.entityId,
          timestamp: event.timestamp,
        },
      );
    } catch (error) {
      console.error(
        "[socket-listener] Error BROADCASTING NOTIFICATION_CREATED:",
        error,
      );
    }
  },
);
