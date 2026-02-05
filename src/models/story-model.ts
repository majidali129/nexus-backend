import { IStory } from "@/types/story";
import mongoose, { HydratedDocument, Schema, Types } from "mongoose";


type StoryDocument = HydratedDocument<IStory>;

const storySchema = new Schema<StoryDocument>({
    authorId: {
        type: Types.ObjectId,
        required: [true, 'Author ID is required'],
        ref: 'User',
        index: true
    },
    type: {
        type: String,
        enum: {
            values: ['image', 'video'],
            message: 'Type must be either image or video'
        },
        required: [true, 'Story type is required']
    },
    mediaUrl: {
        type: String,
        required: [true, 'Media URL is required']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required']
    },
    viewers: {
        type: [Types.ObjectId],
        ref: 'User',
        default: []
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Number,
        required: [true, 'Expiration time is required in milliseconds'],
        index: true // auto delete based on this field
    }
}, {
    timestamps: true
});

export const Story = (mongoose.models?.Story as mongoose.Model<StoryDocument>) || mongoose.model<StoryDocument>('Story', storySchema);