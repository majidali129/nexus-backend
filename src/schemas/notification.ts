import { NotificationType } from "@/types/notification";
import { isValidObjectId } from "mongoose";
import z from "zod";


export const createNotificationSchema = z.object({
    recipientId: z.string().nonempty('Recipient ID is required').refine(id => isValidObjectId(id), 'Invalid recipient ID. Must be a valid MongoDB ObjectId'),
    type: z.enum(Object.values(NotificationType), {
        error: () => `Missing or invalid notification type. Allowed types are ${Object.values(NotificationType).join(', ')}`
    }),
    content: z.string().nonempty('Notification content is required'),
    link: z.string().nonempty('Notification link is required').optional(),
    entityType: z.enum(['post', 'comment', 'story', 'message', 'user'], {
        error: () => 'Missing or invalid entity type. Allowed types are post, comment, story, message, user'
    }),
    entityId: z.string().nonempty('Entity ID is required').refine(id => isValidObjectId(id), 'Invalid entity ID. Must be a valid MongoDB ObjectId')
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;