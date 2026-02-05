import { createNotification, deleteNotification, getAllNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/controllers/notification-controller";
import { Router } from "express";

const router = Router()

router.route('/').post(createNotification).get(getAllNotifications);
router.route('/:notificationId/read').patch(markNotificationAsRead);
router.route('/read-all').patch(markAllNotificationsAsRead);
router.route('/:notificationId').delete(deleteNotification);

export { router as notificationRouter };

export default router;