export type USER_ROLE = 'admin' | 'user';
export type ACCOUNT_STATUS = 'active' | 'banned'

type Media = {
    url: string;
    id: string;
}

export interface IUser {
    username: string
    fullName: string;
    email: string;
    password: string;
    role: USER_ROLE;
    profilePhoto?: Media;
    coverPhoto?: Media;
    bio?: string;
    isPrivate: boolean;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    emailVerificationToken?: string;
    emailVerificationTokenExpires?: Date;
    emailVerifiedAt?: Date;
    passwordResetToken?: string;
    passwordResetTokenExpires?: Date;
    passwordResetTokenIssuedAt?: Date;
    passwordChangedAt?: Date;
    refreshToken?: string;
    isEmailVerified: boolean;
    accountStatus: ACCOUNT_STATUS;
    banReason: string;
    bannedUntil: Date;
    isOnline: boolean;
    lastSeen: Date;
    lastLoginAt?: Date;
}

export interface UserContext {
    currentUserId: string;
    currentUsername: string;
    targetUsername?: string; // for target users profile
}