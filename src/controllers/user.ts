import {
    Request,
    Response,
} from 'express';
import {
    PrismaClient,
    Role,
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

export const getCustomers = async (req: Request, res: Response) => {
    const customers = await prisma.user.findMany({
        where: {
            role: Role.USER,
        },
    });

    if (! customers) {
        res.status(404).json({
            message: 'ERR:USER_NOT_FOUND',
        });
        return;
    }

    res.json({
        customers: customers.map((customer) => ({
            ...customer,
            passwordHash: undefined,
        })),
    });
}
