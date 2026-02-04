import { config } from "@/config/env";
import { ForgotPasswordInput, ResetPasswordInput, SignInInput, SignUpInput, UpdatePasswordInput } from "@/schemas/auth";
import { authService } from "@/services/auth-service";
import { UserContext } from "@/types/user";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request, Response } from "express";

const setTokens = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie('access-token', accessToken, { httpOnly: true, sameSite: "lax", secure: config.NODE_ENV === 'production' });
    res.cookie('refresh-token', refreshToken, { httpOnly: true, sameSite: "lax", secure: config.NODE_ENV === 'production' });
}


const getCtx = (req: Request): UserContext => ({
    userId: req.user.id,
    email: req.user.email,
    token: req.query?.token as string
})

export const signUp = asyncHandler(async (req, res) => {
    const { status, message, userId } = await authService.signUpUser(req.body as SignUpInput);

    return apiResponse(res, status, message, { userId })
})



export const signIn = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.signInUser(req.body as SignInInput)

    // 2. Set cookies
    setTokens(res, accessToken, refreshToken);

    // send response
    return apiResponse(res, 200, 'Signed in successfully', { accessToken }) // for client use in SPA ( headers auth )
});

export const signOut = asyncHandler(async (req, res) => {
    await authService.signOutUser(getCtx(req));

    res.clearCookie('access-token', { path: '/' });
    res.clearCookie('refresh-token', { path: '/' });

    return apiResponse(res, 200, 'Signed out successfully', null);
})

export const updatePassword = asyncHandler(async (req, res) => {
    await authService.updatePassword(getCtx(req), req.body as UpdatePasswordInput);
    return apiResponse(res, 200, 'Password updated successfully', null);
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(getCtx(req));
    return apiResponse(res, 200, 'Current user fetched successfully', { user });
});

export const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken: string = req.cookies['refresh-token'];
    const { status, message, accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

    setTokens(res, accessToken, newRefreshToken);

    return apiResponse(res, status, message);

})

// export const verifyEmail = asyncHandler(async (req, res) => {
//     const result = await authService.verifyEmail(req.query as { token: string, userId: string });
//     return apiResponse(res, result.status, result.message)
// })

// export const forgotPassword = asyncHandler(async (req, res) => {
//     const result = await authService.forgotPassword(req.body as ForgotPasswordInput)
//     return apiResponse(res, result.status, result.message);
// })
// export const resetPassword = asyncHandler(async (req, res) => {
//     const result = await authService.resetPassword(req.query.token as string, req.body as ResetPasswordInput)
//     return apiResponse(res, result.status, result.message);
// })