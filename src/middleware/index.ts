import crypto from 'node:crypto';
import {
    Request,
    RequestHandler,
    Response,
    NextFunction,
} from 'express';
import dayjs from 'dayjs';

export const hashIpAddress = (): RequestHandler => (req: Request, _res: Response, next: NextFunction) => {
    req.ipHash = crypto.createHash('sha1').update(req.ip).digest('hex');
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
