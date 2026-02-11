import { NotificationCreatedEvent } from "@/events/event-types";
import { emitter } from "@/lib/event-bus";
import { Notification } from "@/models/notification-model";
import { User } from "@/models/user-model";
import { CreateNotificationInput } from "@/schemas/notification";
import { NotificationContext } from "@/types/notification";
import { ApiError } from "@/utils/api-error";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";


class NotificationService {
    async createNotification(ctx: NotificationContext, inputData: CreateNotificationInput) {
        // Data is validated from Event-Bus notification listeners, before the communicate to NotificationService;

        const notification = await Notification.create({
            ...inputData,
            senderId: ctx.currentUserId
        });

        if (!notification) {
            throw new ApiError(500, 'Failed to create notification');
        };

        const sender = await User.findById(ctx.currentUserId).select('username profilePhoto').lean();

        const eventData: NotificationCreatedEvent = {
            eventId: randomUUID(),
            timestamp: Date.now(),
            notificationId: notification._id,
            recipientId: notification.recipientId,
            senderId: notification.senderId,
            senderUsername: sender?.username || 'Unknown',
            senderProfilePhoto: sender?.profilePhoto?.url || '',
            type: notification.type,
            content: notification.content,
            link: notification.link,
            entityType: notification.entityType,
            entityId: notification.entityId,
        }

        // Emit event to socket-io for real-time notification
        emitter.emit('notification.created', eventData);

        return {
            status: 201,
            message: 'Notification created successfully',
            notification
        }
    }

    async deleteNotification(ctx: NotificationContext) {

        const deletedNotification = await Notification.findOneAndDelete({
            _id: ctx.notificationId,
            recipientId: ctx.currentUserId // Just For Authorization.
        });

        if (!deletedNotification) {
            throw new ApiError(404, 'Notification not found');
        };

        return {
            status: 200,
            message: 'Notification deleted successfully',
            notification: deletedNotification
        }
    }

    async markNotificationAsRead(ctx: NotificationContext) {
        const updatedNotification = await Notification.findOneAndUpdate({
            _id: ctx.notificationId,
            recipientId: ctx.currentUserId // Just For Authorization.
        }, {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }, {
            new: true
        }).exec();

        if (!updatedNotification) {
            throw new ApiError(404, 'Notification not found or no permission to update');
        };

        return {
            status: 200,
            message: 'Notification marked as read successfully',
            notification: updatedNotification
        }
    }

    async markAllNotificationsAsRead(ctx: NotificationContext) {
        const result = await Notification.updateMany({
            recipientId: ctx.currentUserId
        }, {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }).exec();

        return {
            status: 200,
            message: 'All notifications marked as read successfully',
            result
        }
    }

    async getNotifications(ctx: NotificationContext) {
        const [notifications, totalCount] = await Promise.all([
            Notification.aggregate([
                {
                    $match: {
                        recipientId: new Types.ObjectId(ctx.currentUserId)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'senderId',
                        foreignField: '_id',
                        as: "sender"
                    }
                },
                {
                    $unwind: "$sender"
                },
                {
                    $project: {
                        _id: 1,
                        recipientId: 1,
                        type: 1,
                        content: 1,
                        link: 1,
                        entityType: 1,
                        entityId: 1,
                        isRead: 1,
                        readAt: 1,
                        createdAt: 1,
                        "sender._id": 1,
                        "sender.username": 1,
                        "sender.profilePicture": 1,
                        "sender.fullName": 1,
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]).exec(),
            Notification.countDocuments({
                recipientId: new Types.ObjectId(ctx.currentUserId)
            }).exec()
        ]);

        return {
            status: 200,
            message: 'Notifications retrieved successfully',
            data: {
                totalCount,
                notifications,
            }
        }
    };

}


export const notificationService = new NotificationService();