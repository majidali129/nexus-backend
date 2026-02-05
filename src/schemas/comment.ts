import z from "zod";


export const createCommentSchema = z.object({
    content: z.string().min(1, "Content must be at least 1 character long").max(1000, "Content must be at most 1000 characters long"),
    parentCommentId: z.string().optional(),
});

export const commentUpdateSchema = z.object({
    content: z.string().min(1, "Content must be at least 1 character long").max(1000, "Content must be at most 1000 characters long").optional()
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof commentUpdateSchema>;
