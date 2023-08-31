import {
    getGeneralStatistics,
    getFilesUploadedOnPeriod,
} from '../controllers/statistics';
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
    '/statistics',
    requireAuthentication(),
    restrictTo(Role.ADMIN),
    getGeneralStatistics
);

router.get(
    '/statistics/files-uploaded-on-period',
    requireAuthentication(),
    restrictTo(Role.ADMIN),
    getFilesUploadedOnPeriod
);

export default router;
