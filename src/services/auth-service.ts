import { User } from "@/models/user-model";
import { SignInInput, SignUpInput } from "@/schemas/auth";
import { UserContext } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/utils/jwts";
import bcrypt from 'bcrypt'

class AuthService {
    async signUpUser(signUpData: SignUpInput) {
        const { email, password, ...rest } = signUpData;

        const accountWithEmail = await User.findOne({ email });
        if (accountWithEmail) {
            throw new ApiError(409, 'Email already in use');
        };

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            ...rest, email, password: hashedPassword
        });

        if (!newUser) throw new ApiError(500, 'Failed to create user');

        return {
            status: 201,
            message: 'Account created successfully',
            userId: newUser._id.toString()
        }
    }


    async signInUser(signInData: SignInInput) {
        const { email, password } = signInData;

        const user = await User.findOne({
            email
        }).select('+password +isEmailVerified +refreshToken +role').exec();

        if (!user) throw new ApiError(401, 'Unauthorized: Invalid email or password');

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new ApiError(401, 'Unauthorized: Invalid email or password');

        // generate tokens
        const accessToken = await generateAccessToken({ email, id: user._id.toString(), role: user.role })
        const refreshToken = await generateRefreshToken({ userId: user._id.toString() })
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12); // DB only
        // update user record
        user.refreshToken = hashedRefreshToken;
        user.lastLoginAt = new Date();

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }

    async signOutUser(ctx: UserContext) {
        await User.findByIdAndUpdate(ctx.currentUserId, { $set: { refreshToken: null, lastSeen: new Date() } });
    }

    async updatePassword(ctx: UserContext, data: { currentPassword: string; newPassword: string }) {
        const { currentPassword, newPassword } = data;
        const user = await User.findById(ctx.currentUserId).select('+password').exec();
        if (!user) throw new ApiError(404, 'User not found');

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) throw new ApiError(401, 'Unauthorized: Current password is incorrect');

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        user.passwordChangedAt = new Date();

        await user.save({ validateBeforeSave: false });
        return {
            status: 200,
            message: 'Password updated successfully'
        }
    }
    async getCurrentUser(ctx: UserContext) {
        const user = await User.findById(ctx.currentUserId).select('_id role fullName email profilePhoto').lean().exec();
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }
    async refreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw new ApiError(401, 'Unauthorized Access. Please log in again')
        };
        const decodedToken = await verifyToken(refreshToken, 'refresh');
        const { userId } = decodedToken.payload as { userId: string };

        const user = await User.findOne({
            _id: userId, refreshToken: {
                $ne: null
            }
        }).select('_id role email refreshToken').exec()
        if (!user) {
            throw new ApiError(401, 'Unauthorized Access. Please log in again');
        };

        const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken!);

        if (!isTokenValid) {
            throw new ApiError(401, 'Invalid refresh token. Please log in again.');
        };

        const newAccessToken = await generateAccessToken({ email: user.email, id: userId, role: user.role });
        const newRefreshToken = await generateRefreshToken({ userId });

        user.refreshToken = await bcrypt.hash(newRefreshToken, 12);

        await user.save({ validateBeforeSave: false });

        return {
            status: 200,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    }


    // async verifyEmail(query: { token: string, userId: string }) {
    //     const hashedToken = crypto.createHash('sha256').update(query.token).digest('hex');
    //     const user = await User.findById(query.userId).select('isEmailVerified emailVerificationToken emailVerificationTokenExpires');
    //     if (!user) {
    //         throw new ApiError(404, 'User account not found');
    //     }

    //     if (user.isEmailVerified) {
    //         return {
    //             status: 200,
    //             message: 'Email is already verified'
    //         }
    //     }

    //     if (!user.isEmailVerified && !user.emailVerificationToken) {
    //         throw new ApiError(400, 'Invalid email verification token');
    //     }

    //     const isExpired = user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date();

    //     if (user.emailVerificationToken !== hashedToken || isExpired) {
    //         throw new ApiError(400, 'Invalid or expired email verification token !!!');
    //     }


    //     user.isEmailVerified = true;
    //     user.emailVerificationToken = null;
    //     user.emailVerificationTokenExpires = null;
    //     user.emailVerifiedAt = new Date();
    //     await user.save({ validateBeforeSave: false });
    //     return {
    //         status: 200,
    //         message: 'Email verified successfully'
    //     }
    // }

    //     async forgotPassword({ email }: ForgotPasswordInput) {
    //     const user = await User.findOne({ email });
    //     if (!user) {
    //         throw new ApiError(404, 'Account with the provided email does not exist');
    //     }

    //     const { token: resetToken, hashedToken: hashedResetToken } = generateToken()

    //     user.passwordResetToken = hashedResetToken;
    //     user.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    //     user.passwordResetTokenIssuedAt = new Date();

    //     await user.save({ validateBeforeSave: false });

    //     try {
    //         await sendResetPasswordEmail(email, resetToken);
    //         return {
    //             status: 200,
    //             message: 'Password reset email sent successfully'
    //         }
    //     } catch (error) {
    //         // In case of email sending failure, clear the reset token fields
    //         console.error('Error sending reset password email:', error);
    //         user.passwordResetToken = null;
    //         user.passwordResetTokenExpires = null;
    //         user.passwordResetTokenIssuedAt = null;
    //         await user.save({ validateBeforeSave: false });

    //         throw new ApiError(500, 'There was an error sending the email. Try again later.');
    //     }

    // }
    // async resetPassword(token: string, { newPassword }: ResetPasswordInput) {

    //     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    //     const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExpires: { $gt: Date.now() } }).select('password _id passwordResetToken passwordResetTokenExpires passwordChangedAt passwordResetTokenIssuedAt').exec();
    //     if (!user) throw new ApiError(404, 'Token is invalid or has expired');

    //     // check if current password is changed after token issued
    //     const isPasswordChangedAfterTokenIssue = user.passwordChangedAt && (
    //         user.passwordChangedAt.getTime() > user.passwordResetTokenIssuedAt.getTime()
    //     )

    //     if (isPasswordChangedAfterTokenIssue) {
    //         throw new ApiError(400, 'Password has been changed recently. Please request a new password reset.');
    //     }

    //     user.password = await bcrypt.hash(newPassword, 12);
    //     user.passwordChangedAt = new Date();
    //     user.passwordResetToken = null;
    //     user.passwordResetTokenExpires = null;
    //     user.passwordResetTokenIssuedAt = null;
    //     await user.save({ validateBeforeSave: false });

    //     return {
    //         status: 200,
    //         message: 'Password has been reset successfully'
    //     }
    // }
}


export const authService = new AuthService();