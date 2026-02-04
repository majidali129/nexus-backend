import { config } from "@/config/env";
import { SignJWT, jwtVerify } from "jose";
import { handleJWTError } from "./handle-jwt-error";
import { USER_ROLE } from "@/types/user";




export const generateAccessToken = async (payload: { email: string, id: string, role: USER_ROLE }) => {
    const accessTokenKey = new TextEncoder().encode(config.ACCESS_TOKEN_SECRET);

    return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(config.ACCESS_TOKEN_EXPIRY).sign(accessTokenKey)
}

export const generateRefreshToken = async (payload: { userId: string }) => {
    const refreshTokenKey = new TextEncoder().encode(config.REFRESH_TOKEN_SECRET);

    return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(config.REFRESH_TOKEN_EXPIRY).sign(refreshTokenKey)
};

export const verifyToken = async (token: string, type: 'access' | 'refresh') => {
    try {
        const secret = type === 'access' ? config.ACCESS_TOKEN_SECRET : config.REFRESH_TOKEN_SECRET;
        const tokenKey = new TextEncoder().encode(secret);
        return await jwtVerify(token, tokenKey)
    } catch (error) {
        console.error('Token verification failed:', error);
        throw handleJWTError(error);
    }
};