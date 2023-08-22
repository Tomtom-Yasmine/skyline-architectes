import {
    getFilesByUserId,
    getMyFiles,
    uploadFile,
} from '../controllers/file';
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
import Multer from 'multer';

const router = Router();
const multer = () => Multer({ dest: process.env.FILE_UPLOAD_PATH || '', });

router.get(
    '/files',
    requireAuthentication(),
    restrictTo(Role.USER),
    getMyFiles
);

router.get(
    '/files/:userId',
    requireAuthentication(),
    restrictTo(Role.ADMIN),
    getFilesByUserId
);

router.post(
    '/file',
    requireAuthentication(),
    restrictTo(Role.USER),
    multer().single('file'),
    uploadFile
);

export default router;
