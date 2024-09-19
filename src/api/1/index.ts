import express from 'express';
import usersRoutes from './users';
import loginRoutes from './login';

const router = express.Router();

router.use('/', loginRoutes);
router.use('/users', usersRoutes);

export default router;
