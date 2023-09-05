import {
    Request,
    Response,
} from 'express';
import mime from 'mime-types';
import {
    FileType,
    PrismaClient,
    Role,
} from '@prisma/client';
import jwt from '../modules/jwt';
import {
    slugifyFilename,
} from '../modules/utils';
import { resolve } from 'node:path';

const prisma = new PrismaClient();

export const getMyInvoices = async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
        where: {
            userId: req.user?.id,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    if (! orders) {
        res.status(404).json({
            message: 'ERR:USER_ORDERS_NOT_FOUND',
        });
        return;
    }

    const invoices = await prisma.file.findMany({
        where: {
            userId: req.user?.id,
        },
    });

    if (! invoices) {
        res.status(404).json({
            message: 'ERR:USER_INVOICES_NOT_FOUND',
        });
        return;
    }

    res.status(200).json({
        invoices: orders.map((order) => ({
            ...order,
            ...invoices.find((invoice) => order.fileId === invoice.id)
        })),
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

export const requestAccessByInvoiceId = async (req: Request, res: Response) => {
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

    const token = jwt.forFileAccess(invoice).sign();

    res.json({
        accessToken: token,
    });
};

export const getRawInvoiceById = async (req: Request, res: Response) => {
    const { accessToken, }: { accessToken?: string; } = req.query;

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

    try {
        if (invoice.userId !== req.user?.id
            && (
                ! accessToken
                || ! jwt.forFileAccess(invoice).verify(accessToken)
            )) {
            res.status(403).json({
                message: 'ERR:NOT_AUTHORIZED',
            });
            return;
        }
    } catch (error) {
        res.status(401).json({
            message: 'ERR:INVALID_ACCESS_TOKEN',
        });
        return;
    }

    res.sendFile(
        resolve(invoice.serverPath, invoice.id),
        {
            headers: {
                'Content-Type': mime.contentType(invoice.extension),
                'Content-Disposition': 'inline',
            },
        },
    );
};

export const downloadInvoiceById = async (req: Request, res: Response) => {
    const { accessToken, }: { accessToken?: string; } = req.query;

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

    try {
        if (invoice.userId !== req.user?.id
            && (
                ! accessToken
                || ! jwt.forFileAccess(invoice).verify(accessToken)
            )) {
            res.status(403).json({
                message: 'ERR:NOT_AUTHORIZED',
            });
            return;
        }
    } catch (error) {
        res.status(401).json({
            message: 'ERR:INVALID_ACCESS_TOKEN',
        });
        return;
    }

    res.download(
        resolve(invoice.serverPath, invoice.id),
        invoice.slugName
    );
};
