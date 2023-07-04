import {
    User,
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
            console.log(decoded);
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

export default {
    forUserSession,
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
