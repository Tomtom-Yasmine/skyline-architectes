export {}

declare global {
    namespace Express {
        interface Request {
            ipHash: string;
        }
    }
}
