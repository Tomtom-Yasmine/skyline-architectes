import express from 'express';
import dotenv from 'dotenv';
import securityMiddleware from './middleware/security';
import authRouter from './routers/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
    securityMiddleware.hashIpAddress(),
    express.json(),
    express.urlencoded({ extended: true }),
);

app.use(authRouter);

app.get('/', (req, res) => {
    res.json({
        ip: req.ip,
        ipHash: req.ipHash,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
