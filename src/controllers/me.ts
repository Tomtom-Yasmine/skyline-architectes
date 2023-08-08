import {
    Request,
    Response,
} from 'express';
import {
    PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

export const getMe = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user?.id,
        },
    });

    if (! user) {
        res.status(404).json({
            message: 'ERR:USER_NOT_FOUND',
        });
        return;
    }
    
    res.status(200).json({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            companyName: user.companyName,
            companySiret: user.companySiret,
            companyAddressNumber: user.companyAddressNumber,
            companyAddressStreet: user.companyAddressStreet,
            companyAddressAdditional: user.companyAddressAdditional,
            companyAddressCity: user.companyAddressCity,
            companyAddressZipCode: user.companyAddressZipCode,
            companyAddressCountry: user.companyAddressCountry,
        },
    });
};

export const updateMe = async (req: Request, res: Response) => {
    const { firstName, lastName, email, phoneNumber, companyName, companySiret, companyAddressNumber, companyAddressStreet, companyAddressAdditional, companyAddressCity, companyAddressZipCode, companyAddressCountry } = req.body;

    const updateData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        companyName,
        companySiret,
        companyAddressNumber,
        companyAddressStreet,
        companyAddressAdditional,
        companyAddressCity,
        companyAddressZipCode,
        companyAddressCountry,
    };

    try {
        const user = await prisma.user.update({
            where: {
                id: req.user?.id,
            },
            data: updateData,
        });

        res.status(200).json({
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
    }
};

export const deleteMe = async (req: Request, res: Response) => {
    try {
        await prisma.user.delete({
            where: {
                id: req.user?.id,
            },
        });

        res.status(204).json();
    } catch (error) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
    }
}