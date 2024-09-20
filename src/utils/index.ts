export { secretAuth, tokenAuth } from './auth';

import { Request, Response } from 'express';

export const createRouterEndpoint = (fn: any) => {
    const exec = async (req: Request, res: Response) => {
        try {
            const data = await fn(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error });
        }
    };
    return exec;
};
