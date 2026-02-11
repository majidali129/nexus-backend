import { deleteNotification, getAllNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/controllers/notification-controller";
import { validateParams } from "@/middlewares/validate-params";
import { Router } from "express";

const router = Router()

router.route('/').get(getAllNotifications);
router.route('/:notificationId/read').patch(validateParams('notificationId', true), markNotificationAsRead);
router.route('/read-all').patch(markAllNotificationsAsRead);
router.route('/:notificationId').delete(validateParams('notificationId', true), deleteNotification);

export { router as notificationRouter };

export default router;