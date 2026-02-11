import z from "zod";


export const createPostSchema = z.object({
    caption: z.string().min(1, "Caption can't be empty").max(2200, "Caption can't exceed 2200 characters").optional(),
    media: z.object({
        url: z.url("Media must be a valid URL").refine(value => value !== '', {
            message: "Media URL can't be empty",
        }),
        id: z.string().min(1, "Media ID can't be empty"),

    }),
    type: z.enum(['image', 'video', 'text'], "Invalid post type. Choose from 'image', 'video', or 'text'."),
    visibility: z.enum(['public', 'private', 'friends'], "Invalid post visibility. Choose from 'public', 'private', or 'friends'.").optional(),
    hashtags: z.array(z.string().min(1, "Hashtag can't be empty")).optional(),
    feelings: z.array(z.enum(['happy', 'sad', 'angry', 'excited', 'neutral'], "Invalid feeling. Choose from 'happy', 'sad', 'angry', 'excited', or 'neutral'.")).optional(),
    taggedUsers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")).optional(),
})

export const updatedPostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatedPostSchema>;