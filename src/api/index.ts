import express from 'express';
import apiRoutes from './1';

const router = express.Router();

router.use('/1', apiRoutes);

export default router;
