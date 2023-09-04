import {
    Request,
    Response,
} from 'express';
import {
    FileType,
    PrismaClient,
    Role,
} from '@prisma/client';
import {
    slugifyFilename,
} from '../modules/utils';
import { resolve } from 'node:path';

const prisma = new PrismaClient();

export const getMyInvoices = async (req: Request, res: Response) => {
    const invoices = await prisma.file.findMany({
        where: {
            userId: req.user?.id,
            type: FileType.INVOICE,
        },
    });

    if (! invoices) {
        res.status(404).json({
            message: 'ERR:USER_INVOICES_NOT_FOUND',
        });
        return;
    }

    res.status(200).json({
        invoices,
    });
};

export const getInvoiceById = async (req: Request, res: Response) => {
    const invoice = await prisma.file.findUnique({
        where: {
            id: req.params.invoiceId,
        },
    });

    if (! invoice) {
        res.status(404).json({
            message: 'ERR:INVOICE_NOT_FOUND',
        });
        return;
    }

    if (invoice.userId !== req.user?.id) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }

    res.status(200).json({
        invoice,
    });
};

export const downloadInvoiceById = async (req: Request, res: Response) => {
    const invoice = await prisma.file.findUnique({
        where: {
            id: req.params.invoiceId,
        },
    });

    if (! invoice) {
        res.status(404).json({
            message: 'ERR:INVOICE_NOT_FOUND',
        });
        return;
    }

    if (invoice.userId !== req.user?.id) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }

    res.download(
        resolve(invoice.serverPath, invoice.id),
        invoice.slugName
    );
};
