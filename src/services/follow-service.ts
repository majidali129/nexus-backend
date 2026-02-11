import { Follow } from "@/models/follow-model";
import { User } from "@/models/user-model";
import { FOLLOW_STATUS, FollowContext } from "@/types/follow";
import { ApiError } from "@/utils/api-error";
import { config } from "@/config/env";
import { Types } from "mongoose";
import { withTransaction } from "@/utils/with-transaction";
import {
  FollowAcceptedEvent,
  UserFollowedReqEvent,
} from "@/events/event-types";
import { randomUUID } from "node:crypto";
import { emitter } from "@/lib/event-bus";
import { EVENT_NAMES } from "@/events/event-names";

class FollowService {
  async sendFollowRequest(ctx: FollowContext) {
    if (!ctx.targetUsername) {
      throw new ApiError(400, "Target username is required");
    }

    const targetProfile = await User.findOne({ username: ctx.targetUsername })
      .select("_id status isPrivate fullName")
      .lean()
      .exec();

    if (!targetProfile) {
      throw new ApiError(404, "User not found or no longer exists");
    }

    if (targetProfile._id.toString() === ctx.currentUserId) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    const existingFollow = await Follow.findOne({
      followerId: ctx.currentUserId,
      followingId: targetProfile._id,
    })
      .lean()
      .exec();

    if (existingFollow) {
      if (existingFollow.status === FOLLOW_STATUS.PENDING) {
        throw new ApiError(
          400,
          "Follow request already sent and pending approval",
        );
      } else if (existingFollow.status === FOLLOW_STATUS.ACCEPTED) {
        throw new ApiError(
          400,
          `You are already following ${targetProfile.fullName}`,
        );
      }
    }

    const followStatus = targetProfile.isPrivate
      ? FOLLOW_STATUS.PENDING
      : FOLLOW_STATUS.ACCEPTED;

    const newFollow = await Follow.create({
      followerId: ctx.currentUserId,
      followingId: targetProfile._id,
      status: followStatus,
    });

    if (!newFollow) {
      throw new ApiError(
        500,
        "Failed to follow the user. Please try again later.",
      );
    }

    if (followStatus === FOLLOW_STATUS.PENDING) {
      // if the target profile is private, emit a follow request event
      const eventData: UserFollowedReqEvent = {
        eventId: randomUUID(),
        timestamp: Date.now(),
        followerId: new Types.ObjectId(ctx.currentUserId),
        followerUsername: ctx.currentUsername,
        followedUserId: targetProfile._id,
      };

      emitter.emit(EVENT_NAMES.USER_FOLLOW_REQUEST, eventData);
    } else {
      // if the target profile is public, emit a followed event immediately since the follow is auto-accepted
      const eventData: FollowAcceptedEvent = {
        eventId: randomUUID(),
        timestamp: Date.now(),
        followerId: new Types.ObjectId(ctx.currentUserId),
        followedUserId: targetProfile._id,
        followedUsername: targetProfile.fullName,
      };
      emitter.emit(EVENT_NAMES.USER_FOLLOWED, eventData);
    }

    return {
      status: 200,
      message:
        followStatus === FOLLOW_STATUS.PENDING
          ? "Follow request sent and pending approval"
          : `You are now following ${targetProfile.fullName}`,
    };
  }

  async respondToFollowRequest(
    ctx: FollowContext,
    query: { status?: Omit<FOLLOW_STATUS, "PENDING"> },
  ) {
    if (!query.status) {
      throw new ApiError(
        400,
        "Response status is required and must be either accepted or rejected",
      );
    }

    const follow = await Follow.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(ctx.followReqId),
          followingId: new Types.ObjectId(ctx.currentUserId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followerId",
          foreignField: "_id",
          as: "follower",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "following",
        },
      },
      {
        $unwind: "$follower",
      },
      {
        $unwind: "$following",
      },
      {
        $project: {
          _id: 1,
          status: 1,
          "follower._id": 1,
          "follower.username": 1,
          "follower.fullName": 1,
          "following._id": 1,
          "following.username": 1,
          "following.fullName": 1,
        },
      },
    ]).exec();

    if (follow.length < 1) {
      throw new ApiError(404, "Follow request not found or no longer exists");
    }

    if (follow[0].status !== FOLLOW_STATUS.PENDING) {
      throw new ApiError(
        400,
        "This follow request has already been responded to",
      );
    }

    return withTransaction(async (session) => {
      const result = await Follow.findByIdAndUpdate(
        ctx.followReqId,
        { status: query.status },
        { new: true, session },
      ).exec();

      if (!result) {
        throw new ApiError(
          500,
          "Failed to update follow request status. Please try again later.",
        );
      }

      if (query.status === FOLLOW_STATUS.REJECTED) {
        await Follow.findByIdAndDelete(ctx.followReqId, { session }).exec(); // delete the follow request if rejected
      }

      if (query.status === FOLLOW_STATUS.ACCEPTED) {
        const eventData: FollowAcceptedEvent = {
          eventId: randomUUID(),
          timestamp: Date.now(),
          followerId: result.followerId,
          followedUserId: result.followingId,
          followedUsername: follow[0].following.username,
        };
        emitter.emit(EVENT_NAMES.FOLLOW_REQUEST_ACCEPTED, eventData);
      }

      return {
        status: 200,
        message:
          query.status === FOLLOW_STATUS.ACCEPTED
            ? "Follow request accepted"
            : "Follow request rejected",
      };
    });
  }

  async getAllFollowRequests(
    ctx: FollowContext,
    query: { limit?: string; page?: string },
  ) {
    const limit = query.limit
      ? parseInt(query.limit, 10)
      : config.DEFAULT_RESPONSE_LIMIT;
    const page = query.page ? parseInt(query.page, 10) : 1;
    const skip = (page - 1) * limit;

    const [followRequests, totalCount] = await Promise.all([
      Follow.aggregate([
        {
          $match: {
            followingId: new Types.ObjectId(ctx.currentUserId),
            status: FOLLOW_STATUS.PENDING,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "followerInfo",
          },
        },
        {
          $unwind: "$followerInfo",
        },
        {
          $project: {
            _id: 1,
            status: 1,
            "followerInfo._id": 1,
            "followerInfo.username": 1,
            "followerInfo.fullName": 1,
            "followerInfo.profilePhoto": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
        .limit(limit)
        .skip(skip)
        .exec(),
      Follow.countDocuments({
        followingId: ctx.currentUserId,
        status: FOLLOW_STATUS.PENDING,
      }).exec(),
    ]);

    return {
      status: 200,
      message:
        followRequests.length > 0
          ? "Follow requests fetched successfully"
          : "No follow requests found",
      followRequests,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

export const followService = new FollowService();
