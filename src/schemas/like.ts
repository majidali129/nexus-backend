import z from "zod";


export const likeSchema = z.object({
    resourceType: z.enum(['post', 'comment', 'story'], {
        error: "Invalid resource type. Must be 'post', 'comment', or 'story'."
    }),
})

export type LikeInput = z.infer<typeof likeSchema>;