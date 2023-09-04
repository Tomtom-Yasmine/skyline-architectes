import {
    downloadInvoiceById,
    getInvoiceById,
    getMyInvoices,
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
    '/invoice/:invoiceId/download',
    requireAuthentication(),
    restrictTo(Role.USER),
    downloadInvoiceById
);

export default router;
