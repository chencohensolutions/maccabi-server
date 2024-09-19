export { adminAuth, secretAuth, userAuth, tokenAuth } from './auth';

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

export const validEmail = (email: string) => {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(email).search(filter) != -1;
};

export const convertObj = (obj: any) => {
    const columns = Object.keys(obj);
    const newObj: any = {};
    columns.forEach((col: string) => {
        let newColumn = col.split('_');
        if (newColumn.length !== 1) {
            for (let i = 1; i < newColumn.length; i++) {
                newColumn[i] = newColumn[i].charAt(0).toUpperCase() + newColumn[i].slice(1);
            }
            const newColumnName = newColumn.join('');
            newObj[newColumnName] = obj[col];
        } else {
            newObj[col] = obj[col];
        }
    });
    return newObj;
};
