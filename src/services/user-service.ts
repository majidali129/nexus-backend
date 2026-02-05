import { Follow } from "@/models/follow-model";
import { Post } from "@/models/post-model";
import { User } from "@/models/user-model";
import { UserContext } from "@/types/user";



class UserService {
    async getUserProfile(ctx: UserContext) {

        const profile = await User.findOne({ username: ctx.username }).select('_id isPrivate fullName profilePhoto coverPhoto bio gender dateOfBirth isOnline lastSeen lastLoginAt createdAt').lean().exec();

        if (!profile) {
            throw new Error('User not found or no longer exists');
        };

        const [followersCount, followingCount, postsCount] = await Promise.all([
            Follow.countDocuments({ following: profile._id }).exec(),
            Follow.countDocuments({ follower: profile._id }).exec(),
            Post.countDocuments({ author: profile._id }).exec(),
        ]);


        if (profile.isPrivate) {
            return {
                status: 200,
                message: 'Private profile',
                profile: {
                    ...profile,
                    followersCount,
                    followingCount,
                    postsCount
                }
            }
        };

        const posts = await Post.aggregate([
            {
                $match: { author: profile._id }
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
                            likesCount: "$likesCount",
                            commentsCount: "$commentsCount",
                            createdAt: "$createdAt",
                            visibility: "$visibility",
                            viewsCount: "$viewsCount",
                            hashtags: "$hashtags",
                            feelings: "$feelings",
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    count: 1,
                    posts: 1
                }
            }
        ]).exec();

        return {
            status: 200,
            message: 'User profile fetched successfully',
            profile: {
                ...profile,
                followersCount,
                followingCount,
                postsCount,
                postsByType: posts
            }
        }
    }

    async toggleFollowUser() { }
};

export const userService = new UserService();