import {
    User,
} from '@prisma/client';

export {}

declare global {
    namespace Express {
        interface Request {
            date: dayjs.Dayjs;
            ipHash: string;
            user?: User & {
                numberOfFiles: number;
                totalUsedSizeBytes: number;
            };
        }
    }
}
