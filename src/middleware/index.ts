import {
    Request,
    RequestHandler,
    Response,
    NextFunction,
} from 'express';
import dayjs from 'dayjs';
import crypt from '../modules/crypt';

export const hashIpAddress = (): RequestHandler => async (req: Request, _res: Response, next: NextFunction) => {
    req.ipHash = await crypt.forDefault().hash(req.ip);
    next();
};

export const requestDate = (): RequestHandler => (req: Request, _res: Response, next: NextFunction) => {
    req.date = dayjs(req.headers['date']) || undefined;
    next();
};

export default {
    hashIpAddress,
    requestDate,
};
