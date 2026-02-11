import { User } from "@/models/user-model";
import { USER_ROLE } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { verifyToken } from "@/utils/jwts";
import { DefaultEventsMap, ExtendedError, Socket } from "socket.io";


export type SocketData = {
    userId: string;
    username: string;
    userRole: USER_ROLE
}

export type AuthenticatedSocket = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
>

export const socketAuth = async (socket: Socket, next: (err?: ExtendedError) => void) => {
    try {
        const token = socket.handshake.auth.token ||
            socket.handshake.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('access-token='))?.split('=')[1];

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const decoded = await verifyToken(token, 'access');
        const { id } = decoded.payload as { id: string };

        const user = await User.findById(id).lean().exec();

        if (!user) {
            return next(new ApiError(401, "Authentication error: User not found"));
        }
        const authSocket = socket as unknown as AuthenticatedSocket;

        authSocket.data.userId = user._id.toString();
        authSocket.data.username = user.username;
        authSocket.data.userRole = user.role;

        next(); // Proceed
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new ApiError(401, 'Authentication error: Invalid token'));
    }
}