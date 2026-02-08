import { Follow } from "@/models/follow-model";
import { Post } from "@/models/post-model";
import { User } from "@/models/user-model";
import { POST_VISIBILITY } from "@/types/post";
import { UserContext } from "@/types/user";
import { FOLLOW_STATUS } from '@/types/follow'
import { ApiError } from "@/utils/api-error";

class UserService {
    async getUserProfile(ctx: UserContext) {

        if (!ctx.targetUsername) {
            throw new ApiError(400, 'Target username is required');
        }

        const targetProfile = await User.findOne({ username: ctx.targetUsername }).select('_id isPrivate username isOnline lastSeen gender fullName profilePhoto coverPhoto bio createdAt').lean().exec();

        if (!targetProfile) {
            throw new ApiError(404, 'User not found or no longer exists');
        };

        const isPersonalProfile = targetProfile._id.toString() === ctx.currentUserId;

        const isFollowing = isPersonalProfile
            ?
            true :
            await Follow.exists({ followingId: targetProfile._id, followerId: ctx.currentUserId, status: FOLLOW_STATUS.ACCEPTED }).lean().exec();

        const [followersCount, followingCount] = await Promise.all([
            Follow.countDocuments({ followingId: targetProfile._id }).exec(),
            Follow.countDocuments({ followerId: targetProfile._id }).exec(),
        ]);

        if (targetProfile.isPrivate && !isFollowing && !isPersonalProfile) {
            return {
                status: 200,
                message: 'Private profile',
                profile: {
                    ...targetProfile,
                    followersCount,
                    followingCount,
                    isFollowing: !!isFollowing,
                }
            }
        }

        const visibilityFilter: any = {};

        if (!isPersonalProfile) {
            isFollowing ? {
                $or: [
                    { visibility: POST_VISIBILITY.PUBLIC },
                    { visibility: POST_VISIBILITY.FRIENDS }
                ]
            } : {
                visibility: POST_VISIBILITY.PUBLIC
            }
        };

        const posts = await Post.aggregate([
            {
                $match: {
                    authorId: targetProfile._id,
                    isDeleted: false,
                    isActive: true,
                    ...visibilityFilter,
                },
            },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    posts: {
                        $push: {
                            _id: "$_id",
                            caption: "$caption",
                            media: "$media",
                            type: "$type",
                            likesCount: "$likesCount",
                            commentsCount: "$commentsCount",
                            sharesCount: "$sharesCount",
                            viewsCount: "$viewsCount",
                            visibility: "$visibility",
                            createdAt: "$createdAt",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    count: 1,
                    posts: 1,
                },
            },
            {
                $sort: { type: 1 },
            },
        ]);

        return {
            status: 200,
            message: isPersonalProfile ? 'Your profile' : `Profile of ${targetProfile.username} fetched successfully`,
            profile: {
                ...targetProfile,
                followersCount,
                followingCount,
                isFollowing: !!isFollowing,
                posts,
            },
        }
    }

    // Other user related services like update profile, deactivate account, update or add profile photo / cover photo, user settings ; blocking users, reporting users, searching users etc can be implemented here as the app scales and requires more user related features
};

export const userService = new UserService();