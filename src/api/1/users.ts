import { Router } from 'express';
import { createRouterEndpoint, tokenAuth } from '../../utils';
import { v6 as uuidv6 } from 'uuid';

import * as db from '../../db';

const router = Router();

const createUser = async ({ userName, password }: db.IUser) => {
    const id = uuidv6();
    await db.createUser({ userName, password, id });
    const users = await db.getUsers();
    return users;
};

const deleteUser = async (userId: string) => {
    await db.deleteUser(userId);
    const users = await db.getUsers();
    return users;
};

// Add a new user
router.post('/', tokenAuth, createRouterEndpoint(async ({ body: { userName, password } }: any) => createUser({ userName, password } as db.IUser)));

// Remove a user
router.delete('/:userId', tokenAuth, createRouterEndpoint(async ({ params: { userId } }: any) => deleteUser(userId)));

// Update a user
router.patch('/', tokenAuth, createRouterEndpoint(async ({ body: { userName, user } }: any) => db.updateUser(userName, user)));

// Get all users
router.get('/', tokenAuth, createRouterEndpoint(async () => {
    console.log('getUsers');
    const users = await db.getUsers();
    return users;
}));

export default router;