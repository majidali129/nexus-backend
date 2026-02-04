import * as express from 'express'
import { USER_ROLE } from './user';



declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
                email: string;
                fullName: string;
                role: USER_ROLE
            },
            isProjectMember: boolean;
        }
    }
}