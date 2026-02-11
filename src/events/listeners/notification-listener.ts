import { emitter } from "@/lib/event-bus";
import { EVENT_NAMES } from "../event-names";
import {
  CommentCreatedEvent,
  CommentRepliedEvent,
  FollowAcceptedEvent,
  PostLikedEvent,
  UserFollowedReqEvent,
} from "../event-types";
import { notificationService } from "@/services/notification-service";
import { NotificationType } from "@/types/notification";

emitter.on(EVENT_NAMES.POST_LIKED, async (data: PostLikedEvent) => {
  try {
    if (data.likedByUserId.toString() === data.postAuthorId.toString()) {
      return; // Don't notify if user liked their own post
    }

    const notificationData = {
      recipientId: data.postAuthorId.toString(),
      type: NotificationType.LIKE,
      content: `${data.likedByUsername} liked your post.`,
      entityType: "post" as const,
      entityId: data.postId.toString(),
    };

    await notificationService.createNotification(
      {
        currentUserId: data.likedByUserId,
        currentUserRole: "user",
      },
      notificationData,
    );
  } catch (error) {
    console.error("[notification-listener] Error handling POST_LIKED:", error);
  }
});

emitter.on(EVENT_NAMES.COMMENT_CREATED, async (data: CommentCreatedEvent) => {
  try {
    if (data.commentAuthorId.toString() === data.postAuthorId.toString()) {
      return; // Don't notify if user commented on their own post
    }

    const notificationData = {
      recipientId: data.postAuthorId.toString(),
      type: NotificationType.COMMENT,
      content: `${data.commentAuthorUsername} commented on your post: "${data.content}"`,
      entityType: "post" as const,
      entityId: data.postId.toString(),
    };

    await notificationService.createNotification(
      {
        currentUserId: data.commentAuthorId,
        currentUserRole: "user",
      },
      notificationData,
    );
  } catch (error) {
    console.error(
      "[notification-listener] Error handling COMMENT_CREATED:",
      error,
    );
  }
});

emitter.on(EVENT_NAMES.COMMENT_REPLIED, async (data: CommentRepliedEvent) => {
  try {
    if (
      data.replyAuthorId.toString() === data.parentCommentAuthorId.toString()
    ) {
      return; // Don't notify if user replied to their own comment
    }

    const notificationData = {
      recipientId: data.parentCommentAuthorId.toString(),
      type: NotificationType.COMMENT,
      content: `${data.replyAuthorUsername} replied to your comment: "${data.content}"`,
      entityType: "post" as const,
      entityId: data.postId.toString(),
    };

    await notificationService.createNotification(
      {
        currentUserId: data.replyAuthorId,
        currentUserRole: "user",
      },
      notificationData,
    );
  } catch (error) {
    console.error(
      "[notification-listener] Error handling COMMENT_REPLIED:",
      error,
    );
  }
});

emitter.on(
  EVENT_NAMES.USER_FOLLOW_REQUEST,
  async (event: UserFollowedReqEvent) => {
    try {
      const notificationData = {
        recipientId: event.followedUserId.toString(),
        type: NotificationType.FOLLOW,
        content: `${event.followerUsername} has sent you a follow request.`,
        link: `/users/${event.followerUsername}`,
        entityType: "user" as const,
        entityId: event.followerId.toString(),
      };

      await notificationService.createNotification(
        {
          currentUserId: event.followerId,
          currentUserRole: "user",
          notificationId: undefined,
        },
        notificationData,
      );
    } catch (error) {
      console.error(
        "[notification-listener] Error handling USER_FOLLOW_REQUEST:",
        error,
      );
    }
  },
);

emitter.on(EVENT_NAMES.USER_FOLLOWED, async (event: FollowAcceptedEvent) => {
  try {
    const notificationData = {
      recipientId: event.followedUserId.toString(),
      type: NotificationType.FOLLOW,
      content: `You are now following ${event.followedUsername}.`,
      link: `/users/${event.followedUsername}`,
      entityType: "user" as const,
      entityId: event.followerId.toString(),
    };

    await notificationService.createNotification(
      {
        currentUserId: event.followerId,
        currentUserRole: "user",
        notificationId: undefined,
      },
      notificationData,
    );
  } catch (error) {
    console.error(
      "[notification-listener] Error handling USER_FOLLOWED:",
      error,
    );
  }
});

emitter.on(
  EVENT_NAMES.FOLLOW_REQUEST_ACCEPTED,
  async (event: FollowAcceptedEvent) => {
    try {
      const notificationData = {
        recipientId: event.followedUserId.toString(),
        type: NotificationType.FOLLOW,
        content: `${event.followedUsername} accepted your follow request.`,
        link: `/users/${event.followedUsername}`,
        entityType: "user" as const,
        entityId: event.followerId.toString(),
      };

      await notificationService.createNotification(
        {
          currentUserId: event.followerId,
          currentUserRole: "user",
          notificationId: undefined,
        },
        notificationData,
      );
    } catch (error) {
      console.error(
        "[notification-listener] Error handling USER_FOLLOWED:",
        error,
      );
    }
  },
);

// TODO: Add listeners for story views, message notifications, etc. as needed
