import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
    hashIpAddress,
    requestDate,
    authenticate,
    restrictTo,
} from './middleware';
import authRouter from './routers/auth';
import meRouter from './routers/me';
import { Role, } from '@prisma/client';
import stripe from './routers/stripe';
import { updateUser } from './controllers/user';

dotenv.config();

const app = express();
app.set('x-powered-by', false);
const port = process.env.PORT || 3000;

app.use(
    requestDate(),
    hashIpAddress(),
    cors(),
    express.json(),
    express.urlencoded({ extended: true }),
    authenticate(),
);

app.use(authRouter);
app.use(meRouter);
app.use("/stripe",stripe);

app.get(
    '/',
    restrictTo(Role.USER, Role.ADMIN),
    (req, res) => {
        res.json({
            headers: req.headers,
            date: req.date,
            ipHash: req.ipHash,
            user: req.user,
        });
    },
);

app.post('/webhook', (req, res) => {
    const event = req.body;

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
        break;
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata['user_id'];
      const amount = session.metadata['amount'];
      updateUser(userId, amount);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
