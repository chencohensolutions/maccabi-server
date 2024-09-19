import config from '../config';
const { jwtSecret, registerSecret } = config;
import { EUserRole } from '../db';
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';


export const tokenAuth = async (req: any, res: any, next: any) => {
    try {
        const authorization = req.headers.authorization || '';
        const token = (authorization).replace(/^Bearer\s+/, '');
        if (!token) {
            throw 'No token provided';
        }
        const { email, role } = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        if (email) {
            req.session = {
                email,
                role,
            };
            next();
        } else {
            throw { code: 1, message: 'invalid token' };
        }
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ code: 1, message: err.message });
        } else {
            res.status(401).json({ code: 1, message: 'token error' });
        }
        console.error(`AuthMiddleware Error: ${err}`);
    }
};

export const userAuth = async (req: any, res: any, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization || '';
        const token = authorization.replace(/^Bearer\s+/, '');
        if (!token) {
            throw 'No token provided';
        }
        const { id, role } = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        if (id && role === EUserRole.user) {
            req.session = {
                id,
                role,
            };
            next();
        } else {
            throw { code: 1, message: 'invalid token' };
        }
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ code: 1, message: err.message });
        } else {
            res.status(401).json({ code: 1, message: 'token error' });
        }
        console.error(`AuthMiddleware Error: ${err}`);
    }
};

export const adminAuth = async (req: any, res: any, next: any) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization.replace(/^Bearer\s+/, '');
        if (!token) {
            throw 'No token provided';
        }
        const { email, role } = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        if (email && role === EUserRole.admin) {
            req.session = {
                email,
                role,
            };
            next();
        } else {
            throw { code: 1, message: 'invalid token' };
        }
    } catch (err: any) {
        console.error(`AuthMiddleware Error: ${err.message}`);
        res.status(401).json({ code: err.code, message: err.message });
    }
};

export const secretAuth = async (req: any, res: any, next: any) => {
    try {
        const secret = req.headers.secret;
        if (secret === registerSecret) {
            next();
        } else {
            throw {
                message: 'secret invalid',
            };
        }
    } catch (err: any) {
        console.error(`AuthMiddleware Error: ${err.message}`);
        res.status(401).json({ code: err.code, message: err.message });
    }
};
