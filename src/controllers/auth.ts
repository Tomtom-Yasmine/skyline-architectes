import {
    PrismaClient,
} from '@prisma/client';
import crypt from '../modules/crypt';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const updatePassword = async (req: Request, res: Response) => {
    const {newPassword, confirmPassword, currentPassword} = req.body;
    if (newPassword !== confirmPassword) {
        res.status(400).json({
            message: 'ERR:PASSWORD_CONFIRMATION_MISMATCH',
        });
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: req.user?.id,
        },
    });
    const password = currentPassword;
    if (!await crypt.forPassword().verify(password, user?.passwordHash ?? "")) {
        res.status(401).json({
            message: 'ERR:INVALID_CREDENTIALS',
        });
        return;
    }
    const passwordHash = await crypt.forPassword().hash(newPassword);
    const updateUser = await prisma.user.update({
        where: {
            id: req.user?.id,
        },
        data: {
            passwordHash,
        },
    });
    if (! updateUser) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
        return;
    }
    res.status(200).json({
        message: 'OK:PASSWORD_UPDATED',
    });
};

