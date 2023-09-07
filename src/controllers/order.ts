import {
    Request,
    Response,
} from 'express';
import {
    PrismaClient,
} from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export const createOrder = async (session: Stripe.Checkout.Session, invoiceFileId?: string) => {
    if(!session.metadata) return ;
        return await prisma.order.create({
            data: {
                quantity: +session.metadata.amount,
                unitPriceExcludingTaxes: +session.metadata.amount_excluding_taxes,
                vat: 0.20,
                userId: session.metadata.user_id,
                fileId: invoiceFileId,
            },
        });
}
