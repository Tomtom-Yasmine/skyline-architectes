import express from 'express';
import dotenv from 'dotenv';
import {
    hashIpAddress,
    requestDate,
} from './middleware';
import authRouter from './routers/auth';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
    requestDate(),
    hashIpAddress(),
    cors(),
    express.json(),
    express.urlencoded({ extended: true }),
);

app.use(authRouter);

app.get('/', (req, res) => {
    res.json({
        date: req.date,
        ipHash: req.ipHash,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
