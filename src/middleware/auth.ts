import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import {
    FileType,
    PrismaClient,
    Role,
} from '@prisma/client';
import jwt from '../modules/jwt';

const prisma = new PrismaClient();

export const authenticate = (): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
    const { authorization, } = req.headers;

    if (! authorization) {
        return next();
    }

    const token = authorization.split(' ')[1];

    if (! token) {
        res.status(401).json({
            message: 'ERR:INVALID_SESSION_TOKEN',
        });
        return;
    }

    try {
        const session = jwt.forUserSession().verify(token);

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        });

        if (! user) {
            res.status(401).json({
                message: 'ERR:INVALID_SESSION_TOKEN',
            });
            return;
        }

        let storageAggregate;

        if (user.role === Role.USER) {
            storageAggregate = await prisma.file.aggregate({
                where: {
                    userId: user.id,
                    type: FileType.USER_FILE,
                },
                _count: {
                    id: true,
                },
                _sum: {
                    sizeBytes: true,
                },
                orderBy: {
                    uploadedAt: 'desc',
                },
            });

            if (! storageAggregate) {
                res.status(404).json({
                    message: 'ERR:USER_STORAGE_INFO_NOT_FOUND',
                });
                return;
            }
        }

        req.user = {
            ...user,
            numberOfFiles: storageAggregate?._count.id || 0,
            totalUsedSizeBytes: storageAggregate?._sum.sizeBytes || 0,
        };
        next();
    } catch (error) {
        res.status(401).json({
            message: 'ERR:INVALID_SESSION_TOKEN',
        });
        return;
    }
};

export const requireAuthentication = (): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    if (! req.user) {
        res.status(401).json({
            message: 'ERR:NOT_AUTHENTICATED',
        });
        return;
    }
    next();
}

export const restrictTo = (...roles: Role[]): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    if (! (req.user?.role && roles.includes(req.user?.role))) {
        res.status(403).json({
            message: 'ERR:FORBIDDEN',
        });
        return;
    }
    next();
}
