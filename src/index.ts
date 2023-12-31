import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
    hashIpAddress,
    requestDate,
    authenticate,
} from './middleware';
import authRouter from './routers/auth';
import fileRouter from './routers/file';
import invoiceRouter from './routers/invoice';
import meRouter from './routers/me';
import statisticsRouter from './routers/statistics';
import userRouter from './routers/user';
import {
  FileType,
  PrismaClient,
  Role,
} from '@prisma/client';
import stripe from './routers/stripe';
import { updateUser } from './controllers/user';
import { createOrder } from './controllers/order';
import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import { sendMail } from './controllers/mail';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.set('x-powered-by', false);
const port = process.env.PORT || 3000;

//TODO : Move to somewhere else
//TODO : change type from any to definitive type
const generateInvoicePDF = async (invoiceData: any, filePath: string, orderNumber: number|undefined) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    const emitterName = "Skyline Architectes";
    const emitterAddressStreet = "3 rue de la paix";
    const emitterAddressCity = "75000 Paris"

    doc.fontSize(10).text(emitterName, { align: 'left' });
    doc.fontSize(10).text(emitterAddressStreet, { align: 'left' });
    doc.fontSize(10).text(emitterAddressCity, { align: 'left' });
    doc.fontSize(10).text(invoiceData.metadata.name , { align: 'right' });
    doc.fontSize(10).text(`${invoiceData.metadata.companyName}` , { align: 'right' });
    doc.fontSize(10).text(`Numéro de SIRET : ${invoiceData.metadata.companySiret}`, { align: 'right' });
    doc.fontSize(10).text(`${invoiceData.metadata.companyAddressNumber}, ${invoiceData.metadata.companyAddressStreet}`, { align: 'right' });
    doc.fontSize(10).text(invoiceData.metadata.companyAddressAdditional, { align: 'right' });
    doc.fontSize(10).text(`${invoiceData.metadata.companyAddressZipCode} ${invoiceData.metadata.companyAddressCity}`, { align: 'right' });
    doc.fontSize(10).text(invoiceData.metadata.companyAddressCountry, { align: 'right' });
    doc.moveDown(1);
    const currentDate = new Date();
    doc.fontSize(10).text(`Date: ${currentDate.toLocaleDateString()}`, { align: 'left' });
    doc.fontSize(10).text(`Heure: ${currentDate.toLocaleTimeString()}`, { align: 'left' });
    doc.moveDown(1);
    doc.fontSize(16).text(`Facture N°${orderNumber}`, { align: 'center' });

    doc.fontSize(12)
        .text(`Produit acheté : Stockage skyline architectes (Go)`)
        .text(`Quantité : ${invoiceData.metadata.amount} (Go)`)
        .text(`Prix unitaire (Hors taxes) : ${(invoiceData.metadata.amount - (invoiceData.metadata.amount * 0.20)) / invoiceData.metadata.amount}€`)
        .text(`Montant total (Hors taxes) : ${invoiceData.metadata.amount - (invoiceData.metadata.amount * 0.20)}€`)
        .text(`Montant TVA (20%) : ${invoiceData.metadata.amount * 0.20}€`)
        .text(`Montant total (TTC) : ${invoiceData.metadata.amount }€`);
    
    doc.end();
  };


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
app.use('/stripe', stripe);
app.use(fileRouter);
app.use(invoiceRouter);
app.use(statisticsRouter);
app.use(userRouter);

app.post('/webhook', async (req, res) => {
    const event = req.body;

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      let user;
      let order;

      //Mise à jour du stockage de l'utilisateur
      try {
        user = await updateUser(session.metadata['user_id'], session.metadata['amount']);
      } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour de l'utilisateur");
      } 
    
      //Création de la commande en BDD
      try {
        order = await createOrder(session);
      } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la création de la commande");
      }

      const invoiceFile = await prisma.file.create({
        data: {
          slugName: `invoice-${order?.orderNumber}.pdf`,
          displayName: `Facture #${order?.orderNumber}`,
          serverPath: process.env.FILE_UPLOAD_PATH || '',
          folderPath: '',
          extension: 'pdf',
          sizeBytes: 0,
          type: FileType.INVOICE,
          userId: session.metadata['user_id'],
        },
      });

      await prisma.order.update({
        where: {
          id: order?.id,
        },
        data: {
          fileId: invoiceFile.id,
        },
      });

      const invoiceFilePath = path.resolve(invoiceFile.serverPath, invoiceFile.id);

      try {
        await generateInvoicePDF(session, invoiceFilePath, order?.orderNumber);
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 500);
        });
        const fileSize = fs.statSync(invoiceFilePath).size;
        await prisma.file.update({
          where: {
            id: invoiceFile.id,
          },
          data: {
            sizeBytes: fileSize,
          },
        });
      } catch(error){
        console.error(error);
        res.status(500).send("Erreur lors de la génération de la facture");
      }

      //Envoi de la facture par email
      const clientAppUrl = process.env.CLIENT_URL as string;
      sendMail({
        to: user?.email,
        subject: 'Confirmation d’achat',
        template: 'order-complete',
        data: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          totalPrice: session.metadata?.amount,
          quantity: session.metadata?.amount,
          newStorage: user?.storage,
          invoicesUrl: `${clientAppUrl}/myaccount?tab=invoices`,
        },
      });
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

    res.json({ received: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
