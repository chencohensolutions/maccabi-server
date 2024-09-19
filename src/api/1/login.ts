import { createRouterEndpoint, secretAuth, validEmail } from '../../utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config';
const { jwtSecret } = config;
import { EUserRole, insertUser, getUser, getUsers } from '../../db';

import express from 'express';
const router = express.Router();

const register = async (userName: string, password: string) => {
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const role = EUserRole.admin;

    if (password === '' || password.length < 6) {
        throw { code: 2, message: 'password invalid' };
    }
    if (userName === '' || userName.length < 3) {
        throw { code: 3, message: 'invalid userName' };
    }
    try {
        const result = await insertUser({ userName, password: hashedPassword });
        return result;
    } catch (err) {
    }
};

const loginPassword = async (loginUserName: string, loginPassword: string) => {
    try {
        let { userName, password } = await getUser(loginUserName);
        if (userName) {
            if (loginPassword === password) {
                const token = jwt.sign({ userName }, jwtSecret, { expiresIn: 60 * 60 * 24 * 30 });
                let users = [];
                users = await getUsers();
                return { userName, token, users };
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
}



const loginToken = async (loginToken: string) => {
    try {
        const { userName: loginUserName } = jwt.verify(loginToken, jwtSecret) as jwt.JwtPayload;
        if (loginUserName) {
            let { userName } = await getUser(loginUserName);
            if (userName) {
                let users = [];
                users = await getUsers();
                return { userName, users };
            } else {
                throw { code: ELoginTokenError.Unknown, message: 'unknown error' };
            }
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
    '/register',
    secretAuth,
    createRouterEndpoint(async ({ body: { userName, password, role } }: any) => register(userName, password))
);

router.post(
    '/loginPassword',
    createRouterEndpoint(async ({ body: { userName, password } }: any) => loginPassword(userName, password))
);

router.post(
    '/loginToken',
    createRouterEndpoint(async ({ body: { token } }: any) => loginToken(token))
);

export default router;
