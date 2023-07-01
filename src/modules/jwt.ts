import jwt from 'jsonwebtoken';

const jwtSecret = <string>process.env.SECRET_KEY;

export default {
    sign: (payload: object, options?: jwt.SignOptions): string => {
        return jwt.sign(
            payload,
            jwtSecret,
            options,
        );
    },
    verify: (token: string): object | string => {
        return jwt.verify(
            token,
            jwtSecret,
        );
    },
};
