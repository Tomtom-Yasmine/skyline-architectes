import {
    Request,
    Response,
} from 'express';

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);


export const createCheckoutSession = async (req: Request, res: Response) => {
    const amount = req.body.amount;
    const price = amount;
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
      success_url: `${process.env.CLIENT_URL}${req.body.urlSuccess}`,
      cancel_url: `${process.env.CLIENT_URL}${req.body.urlFailure}`,
      metadata:{
        "user_id": req.user?.id,
        "amount": amount,
    },
    });
    res.send({url : session.url});
  };
  