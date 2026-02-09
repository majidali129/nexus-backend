import { IUser } from "@/types/user";
import mongoose, { HydratedDocument, Model, model, Schema } from "mongoose";


type UserDocument = HydratedDocument<IUser>;

const mediaSchema = new Schema({
	url: {
		type: String,
		required: [true, 'Media URL is required'],
	},
	id: {
		type: String,
		required: [true, 'Media ID is required'],
	},
})

const userSchema = new Schema<UserDocument>({
	username: {
		type: String,
		required: [true, 'Username is required'],
		trim: true,
		minlength: [3, 'Username must be at least 3 characters'],
		maxlength: [30, 'Username cannot exceed 30 characters'],
		unique: true,
	},
	fullName: {
		type: String,
		required: [true, 'Full name is required'],
		trim: true,
		minlength: [3, 'Full name must be at least 3 characters'],
		maxlength: [100, 'Full name cannot exceed 100 characters']
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [8, 'Password must be at least 8 characters long'],
		maxlength: [100, 'Password cannot exceed 100 characters'],
		select: false
	},
	role: {
		type: String,
		enum: {
			values: ['admin', 'user'],
			message: 'Role must be either admin or user'
		},
		default: 'user'
	},
	profilePhoto: {
		type: mediaSchema,
		default: null,
	},
	coverPhoto: {
		type: mediaSchema,
		default: null,
	},
	bio: {
		type: String,
		default: null,
		maxlength: [500, 'Bio cannot exceed 500 characters']
	},
	isPrivate: {
		type: Boolean,
		default: false
	},
	gender: {
		type: String,
		enum: {
			values: ['male', 'female', 'other'],
			message: 'Gender must be either	 male, female or other'
		},
		required: [true, 'Gender is required']
	},
	dateOfBirth: {
		type: Date,
		required: [true, 'Date of birth is required'],
	},
	refreshToken: {
		type: String,
		default: null,
		select: false
	},
	emailVerificationToken: {
		type: String,
		default: null
	},
	emailVerificationTokenExpires: {
		type: Date,
		default: null
	},
	emailVerifiedAt: {
		type: Date,
		default: null
	},
	passwordResetToken: {
		type: String,
		default: null
	},
	passwordResetTokenExpires: {
		type: Number,
		default: null
	},
	passwordResetTokenIssuedAt: {
		type: Date,
		default: null
	},
	passwordChangedAt: {
		type: Date,
		default: null
	},
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	accountStatus: {
		type: String,
		enum: {
			values: ['active', 'banned'],
			message: 'Account status must be either active or banned'
		},
		default: 'active'
	},
	banReason: {
		type: String,
		default: null
	},
	bannedUntil: {
		type: Date,
		default: null
	},
	isOnline: {
		type: Boolean,
		default: false
	},
	lastSeen: {
		type: Date,
		default: null
	},
	lastLoginAt: {
		type: Date,
		default: null
	}
}, { timestamps: true });



export const User = (mongoose.models?.User as Model<UserDocument>) || model<UserDocument>('User', userSchema);