import { Follow } from "@/models/follow-model";
import { Post } from "@/models/post-model";
import { User } from "@/models/user-model";
import { POST_VISIBILITY } from "@/types/post";
import { UserContext } from "@/types/user";
import { FOLLOW_STATUS } from '@/types/follow'
import { ApiError } from "@/utils/api-error";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import fs from 'fs/promises'
import { UpdateProfileInput } from "@/schemas/user";


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

    async updateProfile(ctx: UserContext, profileData: UpdateProfileInput) {
        const updatedProfile = await User.findByIdAndUpdate(ctx.currentUserId, {
            $set: {
                ...profileData,
                updatedAt: new Date(),
            }
        }, { new: true }).exec();

        return {
            status: 200,
            message: 'Profile updated successfully',
            profile: updatedProfile,
        }
    }
    async uploadProfilePhoto(ctx: UserContext, file: Express.Multer.File) {
        if (!file) {
            throw new ApiError(400, 'No file uploaded');
        };

        const result = await uploadToCloudinary(file.path, 'profilePhotos');
        //TODO: do in background job and return response immediately to avoid blocking the event loop and improve performance
        await fs.unlink(file.path); // user fs/promises to avoid blocking the event loop

        await User.findByIdAndUpdate(ctx.currentUserId, {
            $set: {
                profilePhoto: {
                    id: result.public_id.split('/').pop()!,
                    url: result.secure_url,
                }
            }
        }).exec();

        return {
            status: 200,
            message: 'Profile photo uploaded successfully',
            profilePhoto: {
                id: result.public_id.split('/').pop()!,
                url: result.secure_url,
            }
        }
    }

    async uploadCoverPhoto(ctx: UserContext, file: Express.Multer.File) {
        if (!file) {
            throw new ApiError(400, 'No file uploaded');
        };

        const result = await uploadToCloudinary(file.path, 'coverPhotos');

        //TODO: do in background job and return response immediately to avoid blocking the event loop and improve performance
        await fs.unlink(file.path);


        await User.findByIdAndUpdate(ctx.currentUserId, {
            $set: {
                coverPhoto: {
                    id: result.public_id.split('/').pop()!,
                    url: result.secure_url,
                }
            }
        }).exec();

        return {
            status: 200,
            message: 'Cover photo uploaded successfully',
            coverPhoto: {
                id: result.public_id.split('/').pop()!,
                url: result.secure_url,
            }
        }
    }

};

export const userService = new UserService();