import 'module-alias/register';
import 'source-map-support/register';

import express from 'express';
import router from './api';
import cors from 'cors';
import { chatRoomsServer } from './services/ChatRoomsServer';

const app = express();
const port = 3001;

const accessControlAllowOrigin = 'http://localhost:3000'

app.use(
    cors({
        origin: accessControlAllowOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-type,Authorization',
        credentials: true,
    })
);

app.use(express.json());

app.use('/api', router);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

chatRoomsServer.init();