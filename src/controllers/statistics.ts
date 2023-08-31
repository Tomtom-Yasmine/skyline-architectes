import {
    Request,
    Response,
} from 'express';
import {
    FileType,
    PrismaClient, Role,
} from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const getGeneralStatistics = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        where: {
            role: Role.USER,
        },
        include: {
            files: {
                where: {
                    type: FileType.USER_FILE,
                },
            },
        },
    });

    res.json({
        numberOfUsers: users.length,
        numberOfFiles: users.reduce((acc, user) => acc + user.files.length, 0),
        totalUsedStorageBytes: users.reduce((acc, user) => acc + user.files.reduce((acc, file) => acc + file.sizeBytes, 0), 0),
        filesPerUser: users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            value: user.files.length,
            
        })),
        usedStorageBytesPerUser: users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            value: user.files.reduce((acc, file) => acc + file.sizeBytes, 0),
        })),
    });
};

export const getFilesUploadedOnPeriod = async (req: Request, res: Response) => {
    const {
        groupBy,
        startDate,
        endDate,
    } = req.query;

    if (! groupBy || ! ['day', 'month', 'year'].includes(groupBy as string) || ! startDate || ! endDate) {
        res.status(400).json({
            message: 'ERR:BAD_REQUEST',
        });
        return;
    }

    const files = await prisma.file.findMany({
        where: {
            type: FileType.USER_FILE,
            uploadedAt: {
                gte: dayjs(startDate as string).toDate(),
                lte: dayjs(endDate as string).toDate(),
            },
        },
        orderBy: {
            uploadedAt: 'asc',
        },
    });

    const filesGroupedByDate = files.reduce((acc, file) => {
        const date = dayjs(file.uploadedAt).format({ day: 'DD/MM/YYYY', month: 'MM/YYYY', year: 'YYYY' }[groupBy as string]);
        if (! acc[date]) {
            acc[date] = {
                count: 0,
                sizeBytes: 0,
            };
        }
        acc[date].count += 1;
        acc[date].sizeBytes += file.sizeBytes;
        return acc;
    }, {} as Record<string, { count: number, sizeBytes: number }>);

    res.json({
        filesGroupedByDate,
    });
};
