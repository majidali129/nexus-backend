import { Types } from "mongoose";
import { USER_ROLE } from "./user";

export interface IComment {
  content: string;
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  likesCount: number;
  parentCommentId?: Types.ObjectId;
  repliesCount: number;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentContext {
  userId: string;
  userRole: USER_ROLE;
  username: string;
  postId: string;
  commentId?: string;
}
