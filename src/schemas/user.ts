import z from "zod";


export const updateProfileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").max(30, "Username must be at most 30 characters long").optional(),
    fullName: z.string().min(3, "Full name must be at least 3 characters long").max(100, "Full name must be at most 100 characters long").optional(),
    email: z.email("Please provide a valid email address").optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters long").optional(),
    gender: z.enum(['male', 'female', 'other'], "Gender must be either male, female, or other").optional(),
    isPrivate: z.boolean().optional(),
    dateOfBirth: z.coerce.date({
        error: () => "Please provide a valid date of birth"
    }).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;