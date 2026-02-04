import { User } from '@/models/user-model';
import { ApiError } from '@/utils/api-error';
import { asyncHandler } from '@/utils/async-handler';
import { verifyToken } from '@/utils/jwts';
import { Request, Response, NextFunction } from 'express';

export const verifyJWT = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const headers = req.headers.authorization;
    const accessToken: string | null = req.cookies['access-token'] || (headers && headers.startsWith('Bearer ') ? headers.split(' ')[1] : null);
    if (!accessToken) throw new ApiError(401, 'Unauthorized: Please log in to access this resource');

    const decoded = await verifyToken(accessToken, 'access')
    const payload = decoded.payload as { id: string, email: string, role: string };

    const currentUser = await User.findById(payload.id).select('+_id +role +email +isEmailVerified').exec();
    if (!currentUser) throw new ApiError(401, 'Unauthorized: Please log in to access this resource');
    req.user = {
        id: currentUser._id.toString(),
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role,
    }
    next()
})