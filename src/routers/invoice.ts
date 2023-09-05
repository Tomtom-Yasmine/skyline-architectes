import {
    downloadInvoiceById,
    getInvoiceById,
    getMyInvoices,
    getRawInvoiceById,
    requestAccessByInvoiceId,
} from '../controllers/invoice';
import {
    Router,
} from 'express';
import {
    requireAuthentication,
    restrictTo,
} from '../middleware';
import {
    Role,
} from '@prisma/client';

const router = Router();

router.get(
    '/invoices',
    requireAuthentication(),
    restrictTo(Role.USER),
    getMyInvoices
);

router.get(
    '/invoice/:invoiceId',
    requireAuthentication(),
    restrictTo(Role.USER),
    getInvoiceById
);

router.get(
    '/invoice/:invoiceId/access',
    requireAuthentication(),
    requestAccessByInvoiceId
);

router.get(
    '/invoice/:invoiceId/raw',
    getRawInvoiceById
);

router.get(
    '/invoice/:invoiceId/download',
    downloadInvoiceById
);

export default router;
