import { createRouterEndpoint, tokenAuth } from '../../utils';
import { Router } from 'express';
// import { chatRooms } from '../../services/chatRooms';

const router = Router();


// Remove a user

// const getRooms = async () => {
//     const rooms = chatRooms.getRooms();
//     return rooms;
// };

// Get all users
// router.get('/', tokenAuth, createRouterEndpoint(async () => getRooms));

export default router;