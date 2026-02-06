import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { withTransaction } from "@/utils/with-transaction";
import { Like } from "@/models/like-model";
import { Story } from "@/models/story-model";
import { Comment } from "@/models/comment-model";
import { LikeContext } from "@/types/like";
import { Types } from "mongoose";

class LikeService {
    async toggleLike(ctx: LikeContext) {
        if (!ctx.resourceId) {
            throw new ApiError(400, "Resource ID is required");
        }
        if (!ctx.resourceType) {
            throw new ApiError(400, "Resource type is required");
        }
        //! resource = post | comment | story
        let resourceModel: any;

        if (ctx.resourceType === 'post') {
            resourceModel = Post;
        } else if (ctx.resourceType === 'comment') {
            resourceModel = Comment;
        } else if (ctx.resourceType === 'story') {
            resourceModel = Story;
        } else {
            throw new ApiError(400, "Invalid resource type");
        }

        const resource = await resourceModel.findById(ctx.resourceId).lean();
        if (!resource) {
            throw new ApiError(404, `${ctx.resourceType} not found`);
        }

        const isAlreadyLiked = await Like.exists({
            resourceType: ctx.resourceType,
            resourceId: ctx.resourceId,
            userId: ctx.userId
        }).lean();

        if (isAlreadyLiked) {
            // Unlike the target resource
            return withTransaction(async (session) => {
                await Like.deleteOne({
                    resourceType: ctx.resourceType,
                    resourceId: ctx.resourceId,
                    userId: ctx.userId
                }, { session });

                await resourceModel.findByIdAndUpdate(
                    ctx.resourceId,
                    { $inc: { likesCount: -1 } },
                    { session }
                );

                return {
                    status: 200,
                    message: `${ctx.resourceType} unliked successfully`
                }
            })
        } else {
            // Like the target resource
            return withTransaction(async (session) => {
                await Like.create([{
                    resourceType: ctx.resourceType,
                    resourceId: ctx.resourceId,
                    userId: ctx.userId
                }], { session });

                await resourceModel.findByIdAndUpdate(
                    ctx.resourceId,
                    { $inc: { likesCount: 1 } },
                    { session }
                );

                return {
                    status: 201,
                    message: `${ctx.resourceType} liked successfully`
                }
            })
        }
    }

    async getLikes(ctx: LikeContext) {

        const likes = await Like.aggregate([
            {
                $match: {
                    resourceType: ctx.resourceType,
                    resourceId: new Types.ObjectId(ctx.resourceId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    "user._id": 1,
                    "user.username": 1,
                    "user.fullName": 1,
                    "user.profilePhoto": 1,
                    createdAt: 1
                }
            }
        ]);

        return {
            status: 200,
            message: "Likes retrieved successfully",
            likes
        }
    };

}


export const likeService = new LikeService();