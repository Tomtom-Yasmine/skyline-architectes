import {
    deleteFileById,
    downloadFileById,
    getFileById,
    getFilesByUserId,
    getMyFiles,
    getRawFileById,
    requestAccessByFileId,
    updateFileById,
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
const multer = () => Multer({ storage: Multer.memoryStorage(), });

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

router.get(
    '/file/:fileId',
    requireAuthentication(),
    getFileById
);

router.get(
    '/file/:fileId/access',
    requireAuthentication(),
    requestAccessByFileId
);

router.get(
    '/file/:fileId/raw',
    getRawFileById
);

router.get(
    '/file/:fileId/download',
    downloadFileById
);

router.delete(
    '/file/:fileId',
    requireAuthentication(),
    deleteFileById
);

router.patch(
    '/file/:fileId',
    requireAuthentication(),
    restrictTo(Role.USER),
    updateFileById
);

export default router;
