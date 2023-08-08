import {
    Request,
    Response,
} from 'express';
import {
    PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

export const updateUser = async (userId : string, storageAdditional : number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        console.error(`User ${userId} not found`);
        return;
    }
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                storage : user.storage + +storageAdditional,
        }
    });
    } catch (error) {
        console.error(error);
    }
};