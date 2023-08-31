import {
    getCustomers,
} from '../controllers/user';
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
    '/customers',
    requireAuthentication(),
    restrictTo(Role.ADMIN),
    getCustomers
);

export default router;
