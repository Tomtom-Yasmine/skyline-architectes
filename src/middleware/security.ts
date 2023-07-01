import crypto from 'node:crypto';
import {
    Request,
    RequestHandler,
    Response,
    NextFunction,
} from 'express';

const hashIpAddress = (): RequestHandler => (req: Request, _res: Response, next: NextFunction) => {
    req.ipHash = crypto.createHash('sha1').update(req.ip).digest('hex');
    next();
};

export default {
    hashIpAddress,
};
