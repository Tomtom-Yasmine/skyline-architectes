import {
    Request,
    Response,
} from 'express';
import {
    FileType,
    PrismaClient,
    Role,
} from '@prisma/client';
import { sendMail } from './mail';

const prisma = new PrismaClient();

export const getMe = async (req: Request, res: Response) => {
    const { user, } = req;

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
            role: user.role,
            storage: user.storage,
            totalUsedSizeBytes: user.totalUsedSizeBytes,
            numberOfFiles: user.numberOfFiles,
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
        await prisma.file.deleteMany({
            where: {
                userId: req.user?.id,
                type: FileType.USER_FILE,
            },
        });
        
        await prisma.user.delete({
            where: {
                id: req.user?.id,
            },
        });

        sendMail({
            to: req.user?.email,
            subject: 'Compte supprimé',
            template: 'account-deleted',
            data: {
                firstName: req.user?.firstName,
                lastName: req.user?.lastName,
                email: req.user?.email,
            },
        });

        prisma.user.findMany({
            where: {
                role: Role.ADMIN,
            },
        })
            .then((admins) => {
                admins.forEach((admin) => {
                    sendMail({
                        to: admin.email,
                        subject: 'Un utilisateur a supprimé son compte',
                        template: 'account-deleted-admin',
                        data: {
                            adminFirstName: admin.firstName,
                            adminLastName: admin.lastName,
                            adminEmail: admin.email,
                            firstName: req.user?.firstName,
                            lastName: req.user?.lastName,
                            email: req.user?.email,
                        },
                    });
                });
            });

        res.status(204).json();
    } catch (error) {
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
    }
}
