import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { isValidObjectId } from 'mongoose'


export const validateParams = (params: string, isMongoIdFlag: boolean) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let baseSchema = z.string().trim().min(1, { message: `${params} is required` });
        if (isMongoIdFlag) {
            baseSchema = baseSchema.refine(value => isValidObjectId(value), {
                message: `${params} must be a valid MongoDB ObjectId`
            });
        };

        const validationSchema = z.object({
            [params]: baseSchema
        })

        const result = validationSchema.safeParse(req.params);

        if (!result.success) {
            const error = result.error;
            return res.status(400).json({
                success: false,
                message: isMongoIdFlag ? `${params} must be a valid MongoDB ObjectId` : `${params} is required and must be a non-empty string`,
                errors: error.issues.map(iss => ({
                    path: iss.path,
                    message: iss.message
                }))
            })
        }

        return next()
    }

}
