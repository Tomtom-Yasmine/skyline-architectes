export {}

declare global {
    namespace Express {
        interface Request {
            date: dayjs.Dayjs;
            ipHash: string;
        }
    }
}
