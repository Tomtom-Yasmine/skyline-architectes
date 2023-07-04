import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import {
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

        req.user = user;
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
