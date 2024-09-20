import { createRouterEndpoint } from '../../utils';
// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config';
const { jwtSecret } = config;
import { getUser, getUsers } from '../../db';

import express from 'express';
const router = express.Router();

const loginPassword = async (loginUserName: string, loginPassword: string) => {
    try {
        const user = await getUser(loginUserName);
        if (!user) {
            throw { code: 5, message: 'user not exists' };
        }
        const { userName, password, id } = user;
        if (userName) {
            if (loginPassword === password) {
                const token = jwt.sign({ userName, id }, jwtSecret, { expiresIn: 60 * 60 * 24 * 30 });
                return { userName, token, id };
            } else {
                throw { code: 4, message: 'password incorrect' };
            }
        } else {
            throw { code: 5, message: 'user not exists' };
        }
    } catch (err) {
        throw err;
    }
};

enum ELoginTokenError {
    Unknown = 1,
    TokenExpired,
    TokenInvalid,
    UserNotExists,
}

const loginToken = async (loginToken: string) => {
    try {
        const { userName: loginUserName } = jwt.verify(loginToken, jwtSecret) as jwt.JwtPayload;
        if (loginUserName) {
            const user = await getUser(loginUserName);
            if (!user) {
                throw { code: ELoginTokenError.UserNotExists, message: 'user not exists' };
            }
            const { userName, id } = user;
            return { userName, id };
        } else {
            throw { code: ELoginTokenError.Unknown, message: 'unknown error' };
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            if (err.message === 'jwt expired') {
                throw { code: ELoginTokenError.TokenExpired, message: 'session expired' };
            }
        }
        throw err;
    }
};

router.post(
    '/loginPassword',
    createRouterEndpoint(async ({ body: { userName, password } }: any) => loginPassword(userName, password))
);

router.post(
    '/loginToken',
    createRouterEndpoint(async ({ body: { token } }: any) => loginToken(token))
);

export default router;
