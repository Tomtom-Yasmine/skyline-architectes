import {
    User,
} from '@prisma/client';
import jwt from 'jsonwebtoken';

const jwtSecret = <string>process.env.SECRET_KEY;

type JwtFactory = {
    sign: (options?: object) => string;
    verify: (token: string) => jwt.JwtPayload | string;
};

const forUserSession = (user: User): JwtFactory => {
    return {
        sign: (): string => {
            return jwt.sign(
                {
                    role: user.role,
                },
                jwtSecret,
                {
                    subject: user.id,
                    expiresIn: '365d',
                },
            );
        },
        verify: (token: string): jwt.JwtPayload | string => {
            return jwt.verify(
                token,
                jwtSecret,
            );
        },
    };
};

export default {
    forUserSession,
    sign: (payload: jwt.JwtPayload, options?: jwt.SignOptions): string => {
        return jwt.sign(
            payload,
            jwtSecret,
            options,
        );
    },
    verify: (token: string): jwt.JwtPayload | string => {
        return jwt.verify(
            token,
            jwtSecret,
        );
    },
};
