import {
    Request,
    Response,
} from 'express';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY as string, {apiVersion: '2022-11-15'});

export const createCheckoutSession = async (req: Request, res: Response) => {
    const amount = req.body.amount;
    const {user, ...restMetadata} = req.body.metadata;
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Stockage de ${amount}Go`,
            },
            unit_amount: amount*100/amount,
          },
          quantity: amount,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}${req.body.urlSuccess}`,
      cancel_url: `${process.env.CLIENT_URL}${req.body.urlFailure}`,
      metadata: {
        ...restMetadata,
        "user_id": req.user?.id,
        "amount": amount,
        "amount_excluding_taxes":amount- amount*0.2,
    },
    });
    res.send({url : session.url});
  };
  