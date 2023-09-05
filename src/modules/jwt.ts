import {
    User,
    File,
} from '@prisma/client';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const getJwtSecret = () => <string>process.env.SECRET_KEY;

type JwtFactory<T> = {
    sign: (options?: object) => string;
    verify: (token: string) => T;
};

enum JwtPurpose {
    UserSession = 'user-session',
    EmailVerification = 'email-verification',
    PasswordReset = 'password-reset',
    FileAccess = 'file-access',
}

const forUserSession = (user?: User): JwtFactory<{
    user: {
        id: string;
        role: string;
    };
    expirationDate: dayjs.Dayjs;
}> => {
    return {
        sign: (): string => {
            if (! user) {
                throw new Error('ERR:SUBJECT_USER_REQUIRED_TO_CREATE_SESSION_TOKEN');
            }
            return jwt.sign(
                {
                    purpose: 'user-session',
                    role: user.role,
                },
                getJwtSecret(),
                {
                    subject: user.id,
                    expiresIn: '365d',
                },
            );
        },
        verify: (token: string) => {
            const decoded = jwt.verify(
                token,
                getJwtSecret(),
                {
                    subject: user?.id,
                    complete: true,
                },
            );
            if (typeof decoded.payload === 'string'
            || ! decoded.payload.sub
            || decoded.payload.purpose !== JwtPurpose.UserSession) {
                throw new Error('ERR:INVALID_SESSION_TOKEN');
            }
            return {
                user: {
                    id: decoded.payload.sub,
                    role: decoded.payload.role,
                },
                expirationDate: dayjs(decoded.payload.exp),
            };
        },
    };
};

const forFileAccess = (file?: File): JwtFactory<{
    file: {
        id: string;
    };
    expirationDate: dayjs.Dayjs;
}> => {
    return {
        sign: (): string => {
            if (! file) {
                throw new Error('ERR:SUBJECT_FILE_REQUIRED_TO_CREATE_ACCESS_TOKEN');
            }
            return jwt.sign(
                {
                    purpose: JwtPurpose.FileAccess,
                },
                getJwtSecret(),
                {
                    subject: file.id,
                    expiresIn: '10m',
                },
            );
        },
        verify: (token: string) => {
            const decoded = jwt.verify(
                token,
                getJwtSecret(),
                {
                    subject: file?.id,
                    complete: true,
                },
            );
            if (typeof decoded.payload === 'string'
            || ! decoded.payload.sub
            || decoded.payload.purpose !== JwtPurpose.FileAccess) {
                throw new Error('ERR:INVALID_ACCESS_TOKEN');
            }
            return {
                file: {
                    id: decoded.payload.sub,
                },
                expirationDate: dayjs(decoded.payload.exp),
            };
        },
    };
};

export default {
    forUserSession,
    forFileAccess,
    sign: (payload: jwt.JwtPayload, options?: jwt.SignOptions): string => {
        return jwt.sign(
            payload,
            getJwtSecret(),
            options,
        );
    },
    verify: (token: string): jwt.JwtPayload | string => {
        return jwt.verify(
            token,
            getJwtSecret(),
        );
    },
};
