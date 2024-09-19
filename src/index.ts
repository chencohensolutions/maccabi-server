import 'module-alias/register';
import 'source-map-support/register';

import express from 'express';
import router from './api';
import cors from 'cors';
import WebSocket from 'ws';
import http from 'http';

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

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});