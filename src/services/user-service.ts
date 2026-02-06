import { Follow } from "@/models/follow-model";
import { Post } from "@/models/post-model";
import { User } from "@/models/user-model";
import { POST_VISIBILITY } from "@/types/post";
import { UserContext } from "@/types/user";
import { FOLLOW_STATUS } from '@/types/follow'
import { ApiError } from "@/utils/api-error";
import { apiResponse } from "@/utils/api-response";
import { config } from "@/config/env";

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

    async sendFollowRequest(ctx: UserContext) {
        if (!ctx.targetUsername) {
            throw new ApiError(400, 'Target username is required');
        }

        const targetProfile = await User.findOne({ username: ctx.targetUsername }).select('_id status isPrivate').lean().exec();

        if (!targetProfile) {
            throw new ApiError(404, 'User not found or no longer exists');
        };

        if (targetProfile._id.toString() === ctx.currentUserId) {
            throw new ApiError(400, 'You cannot follow yourself');
        }

        const existingFollow = await Follow.findOne({ followerId: ctx.currentUserId, followingId: targetProfile._id }).lean().exec();

        if (existingFollow) {
            if (existingFollow.status === FOLLOW_STATUS.PENDING) {
                throw new ApiError(400, 'Follow request already sent and pending approval');
            } else if (existingFollow.status === FOLLOW_STATUS.ACCEPTED) {
                throw new ApiError(400, 'You are already following this user');
            } else if (existingFollow.status === FOLLOW_STATUS.BLOCKED) {
                throw new ApiError(403, 'You are blocked from following this user');
            }
        }

        const followStatus = targetProfile.isPrivate ? FOLLOW_STATUS.PENDING : FOLLOW_STATUS.ACCEPTED;

        const newFollow = await Follow.create({
            followerId: ctx.currentUserId,
            followingId: targetProfile._id,
            status: followStatus,
        })

        if (!newFollow) {
            throw new ApiError(500, 'Failed to follow the user. Please try again later.');
        }

        return {
            status: 200,
            message: followStatus === FOLLOW_STATUS.PENDING ? 'Follow request sent and pending approval' : 'You are now following the user',
        }
    }

    async respondToFollowRequest(ctx: UserContext, followReqId: string, status: FOLLOW_STATUS.ACCEPTED | FOLLOW_STATUS.BLOCKED) {
        if (!ctx.targetUsername) {
            throw new ApiError(400, 'Target username is required');
        };

        if (ctx.currentUsername !== ctx.targetUsername) {
            throw new ApiError(403, 'You are not authorized to respond to this follow request');
        }

        const follow = await Follow.findOne({
            _id: followReqId,
            followingId: ctx.currentUserId,
        }).exec();

        if (!follow) {
            throw new ApiError(404, 'Follow request not found or no longer exists');
        };

        if (follow.status !== FOLLOW_STATUS.PENDING) {
            throw new ApiError(400, 'This follow request has already been responded to');
        }

        const result = await Follow.findByIdAndUpdate(followReqId, { status }, { new: true }).exec();
        if (!result) {
            throw new ApiError(500, 'Failed to update follow request status. Please try again later.');
        };



        return {
            status: 200,
            message: status === FOLLOW_STATUS.ACCEPTED ? 'Follow request accepted' : 'Follow request rejected',
        }

    };

    async getAllFollowRequests(ctx: UserContext, query: { limit?: string, page?: string }) {
        const limit = query.limit ? parseInt(query.limit, 10) : config.DEFAULT_RESPONSE_LIMIT;
        const page = query.page ? parseInt(query.page, 10) : 1;
        const skip = (page - 1) * limit;

        const [followRequests, totalCount] = await Promise.all([
            Follow.find({ followingId: ctx.currentUserId, status: FOLLOW_STATUS.PENDING }).skip(skip).limit(limit).lean().exec(),
            Follow.countDocuments({ followingId: ctx.currentUserId, status: FOLLOW_STATUS.PENDING }).exec(),
        ]);

        return {
            status: 200,
            message: 'Follow requests fetched successfully',
            followRequests,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            }
        }
    }
};

export const userService = new UserService();