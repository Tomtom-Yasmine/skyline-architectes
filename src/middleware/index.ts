import {
    Request,
    RequestHandler,
    Response,
    NextFunction,
} from 'express';
import dayjs from 'dayjs';
import crypt from '../modules/crypt';
import {
    authenticate,
    requireAuthentication,
    restrictTo,
} from './auth';

export const hashIpAddress = (): RequestHandler => async (req: Request, _res: Response, next: NextFunction) => {
    req.ipHash = await crypt.forDefault().hash(req.ip);
    next();
};

export const requestDate = (): RequestHandler => (req: Request, _res: Response, next: NextFunction) => {
    req.date = req.headers['date'] ? dayjs(req.headers['date']) : undefined;
    next();
};

export {
    authenticate,
    requireAuthentication,
    restrictTo,
};
