
import { Follow } from "@/models/follow-model";
import { User } from "@/models/user-model";
import { FOLLOW_STATUS, FollowContext } from '@/types/follow'
import { ApiError } from "@/utils/api-error";
import { config } from "@/config/env";
import { Types } from "mongoose";
import { withTransaction } from "@/utils/with-transaction";

class FollowService {

    async sendFollowRequest(ctx: FollowContext) {
        if (!ctx.targetUsername) {
            throw new ApiError(400, 'Target username is required');
        }

        const targetProfile = await User.findOne({ username: ctx.targetUsername }).select('_id status isPrivate fullName').lean().exec();

        if (!targetProfile) {
            throw new ApiError(404, 'User not found or no longer exists');
        };

        if (targetProfile._id.toString() === ctx.currentUserId) {
            throw new ApiError(400, 'You cannot follow yourself');
        }

        const existingFollow = await Follow.findOne({ followerId: ctx.currentUserId, followingId: targetProfile._id }).lean().exec();

        console.log(existingFollow)
        if (existingFollow) {
            if (existingFollow.status === FOLLOW_STATUS.PENDING) {
                throw new ApiError(400, 'Follow request already sent and pending approval');
            } else if (existingFollow.status === FOLLOW_STATUS.ACCEPTED) {
                throw new ApiError(400, `You are already following ${targetProfile.fullName}`);
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
            message: followStatus === FOLLOW_STATUS.PENDING ? 'Follow request sent and pending approval' : `You are now following ${targetProfile.fullName}`,
        }
    }

    async respondToFollowRequest(ctx: FollowContext, query: { status?: Omit<FOLLOW_STATUS, "PENDING"> }) {

        if (!query.status) {
            throw new ApiError(400, 'Response status is required and must be either accepted or rejected');
        }

        const follow = await Follow.findOne({
            _id: ctx.followReqId,
            followingId: ctx.currentUserId,
        }).exec();

        if (!follow) {
            throw new ApiError(404, 'Follow request not found or no longer exists');
        };

        if (follow.status !== FOLLOW_STATUS.PENDING) {
            throw new ApiError(400, 'This follow request has already been responded to');
        }

        return withTransaction(async (session) => {
            const result = await Follow.findByIdAndUpdate(ctx.followReqId, { status: query.status }, { new: true, session }).exec();

            if (!result) {
                throw new ApiError(500, 'Failed to update follow request status. Please try again later.');
            };

            if (query.status === FOLLOW_STATUS.REJECTED) {
                await Follow.findByIdAndDelete(ctx.followReqId, { session }).exec(); // delete the follow request if rejected
            }

            return {
                status: 200,
                message: query.status === FOLLOW_STATUS.ACCEPTED ? 'Follow request accepted' : 'Follow request rejected',
            }

        })

    };

    async getAllFollowRequests(ctx: FollowContext, query: { limit?: string, page?: string }) {
        const limit = query.limit ? parseInt(query.limit, 10) : config.DEFAULT_RESPONSE_LIMIT;
        const page = query.page ? parseInt(query.page, 10) : 1;
        const skip = (page - 1) * limit;

        const [followRequests, totalCount] = await Promise.all([
            Follow.aggregate([
                {
                    $match: {
                        followingId: new Types.ObjectId(ctx.currentUserId), status: FOLLOW_STATUS.PENDING
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'followerId',
                        foreignField: '_id',
                        as: 'followerInfo',
                    }
                },
                {
                    $unwind: '$followerInfo'
                },
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        "followerInfo._id": 1,
                        "followerInfo.username": 1,
                        "followerInfo.fullName": 1,
                        "followerInfo.profilePhoto": 1,
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]).limit(limit).skip(skip).exec(),
            Follow.countDocuments({ followingId: ctx.currentUserId, status: FOLLOW_STATUS.PENDING }).exec(),
        ])


        return {
            status: 200,
            message: followRequests.length > 0 ? 'Follow requests fetched successfully' : 'No follow requests found',
            followRequests,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            }
        }
    }

}


export const followService = new FollowService();