import { Router } from 'express';
import { createRouterEndpoint, tokenAuth } from '../../utils';
import { getUsers,insertUser, IUser } from '../../db';

const router = Router();

// Add a new user
router.post('/', createRouterEndpoint(async ({ body: { email, userName, password } }: any) => insertUser({email, userName, password} as IUser)));

// Remove a user
router.delete('/remove/:id', (req, res) => {
    const userId = req.params.id;
    // Logic to remove a user by ID
    res.send(`User with ID ${userId} removed`);
});

// Update a user
router.put('/update/:id', (req, res) => {
    const userId = req.params.id;
    // Logic to update a user by ID
    res.send(`User with ID ${userId} updated`);
});

// Get a user
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    // Logic to get a user by ID
    res.send(`User with ID ${userId} fetched`);
});

router.get('/', createRouterEndpoint(async () => getUsers()));

export default router;