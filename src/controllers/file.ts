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
    extname,
} from 'node:path';
import {
    slugifyFilename,
} from '../modules/utils';

const prisma = new PrismaClient();

export const getMyFiles = async (req: Request, res: Response) => {
    const files = await prisma.file.findMany({
        where: {
            userId: req.user?.id,
            type: FileType.USER_FILE,
        },
    });

    if (! files) {
        res.status(404).json({
            message: 'ERR:USER_FILES_NOT_FOUND',
        });
        return;
    }

    res.status(200).json({
        files,
    });
};

export const getFilesByUserId = async (req: Request, res: Response) => {
    const files = await prisma.file.findMany({
        where: {
            userId: req.params.userId,
            type: FileType.USER_FILE,
        },
    });

    if (! files) {
        res.status(404).json({
            message: 'ERR:USER_FILES_NOT_FOUND',
        });
        return;
    }

    res.status(200).json({
        files,
    });
};

export const uploadFile = async (req: Request, res: Response) => {
    if (! req.file) {
        res.status(400).json({
            message: 'ERR:FILE_NOT_FOUND',
        });
        return;
    }

    const {
        originalname,
        size,
    } = req.file;

    if (! req.user) {
        res.status(401).json({
            message: 'ERR:NOT_AUTHENTICATED',
        });
        return;
    }

    if (req.user.totalUsedSizeBytes + size > req.user.storage) {
        res.status(400).json({
            message: 'ERR:USER_STORAGE_LIMIT_EXCEEDED',
        });
        return;
    }

    const extension = extname(originalname).replace('.', '');
    const slugName = slugifyFilename(originalname);

    const file = await prisma.file.create({
        data: {
            displayName: originalname,
            slugName,
            sizeBytes: size,
            folderPath: '',
            serverPath: process.env.FILE_UPLOAD_PATH || '',
            extension,
            type: FileType.USER_FILE,
            userId: req.user.id,
        },
    });

    if (! file) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
        return;
    }

    res.status(201).json({
        file,
    });
};

export const getFileById = async (req: Request, res: Response) => {
    const file = await prisma.file.findUnique({
        where: {
            id: req.params.fileId,
        },
    });

    if (! file) {
        res.status(404).json({
            message: 'ERR:FILE_NOT_FOUND',
        });
        return;
    }

    if (file.userId !== req.user?.id && req.user?.role !== Role.ADMIN) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }

    res.status(200).json({
        file,
    });
};

export const downloadFileById = async (req: Request, res: Response) => {
    const file = await prisma.file.findUnique({
        where: {
            id: req.params.fileId,
        },
    });

    if (! file) {
        res.status(404).json({
            message: 'ERR:FILE_NOT_FOUND',
        });
        return;
    }

    if (file.userId !== req.user?.id && req.user?.role !== Role.ADMIN) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }

    res.download(file.serverPath);
};

export const deleteFileById = async (req: Request, res: Response) => {
    const file = await prisma.file.findUnique({
        where: {
            id: req.params.fileId,
        },
    });

    if (! file) {
        res.status(404).json({
            message: 'ERR:FILE_NOT_FOUND',
        });
        return;
    }

    if (file.userId !== req.user?.id && req.user?.role !== Role.ADMIN) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }
    
    await prisma.file.delete({
        where: {
            id: req.params.fileId,
        },
    });

    res.status(204).json();
};

export const updateFileById = async (req: Request, res: Response) => {
    const {
        slugName,
        displayName,
        folderPath,
        isPinned,
        isDeleted,
    } = req.body;

    const file = await prisma.file.findUnique({
        where: {
            id: req.params.fileId,
        },
    });

    if (! file) {
        res.status(404).json({
            message: 'ERR:FILE_NOT_FOUND',
        });
        return;
    }

    if (file.userId !== req.user?.id) {
        res.status(403).json({
            message: 'ERR:NOT_AUTHORIZED',
        });
        return;
    }

    const updateData = {
        slugName,
        displayName,
        folderPath,
        isPinned,
        isDeleted,
    };

    try {
        const file = await prisma.file.update({
            where: {
                id: req.params.fileId,
            },
            data: updateData,
        });

        res.status(200).json({
            file,
        });
    } catch (error) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
    }
};
