// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
const express = require('express');
const Stripe = require('stripe');
require("dotenv").config();

const router = express.Router();
// const app = express();
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

router.post('/create-checkout-session', async (req: any, res: any) => {

  const amount = req.body.data.amount;
  const price = amount;
  console.log(req.body.data);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Stockage de ${amount}Go`,
          },
          unit_amount: price*100/amount,
        },
        quantity: amount,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/myaccount`,
  });

  res.send({url : session.url});
});

export default router;