import {
    Request,
    Response,
} from 'express';
import {
    FileType,
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
        include: {
            files: {
                where: {
                    type: FileType.USER_FILE,
                },
            },
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
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            companyName: customer.companyName,
            companySiret: customer.companySiret,
            companyAddressNumber: customer.companyAddressNumber,
            companyAddressStreet: customer.companyAddressStreet,
            companyAddressAdditional: customer.companyAddressAdditional,
            companyAddressCity: customer.companyAddressCity,
            companyAddressZipCode: customer.companyAddressZipCode,
            companyAddressCountry: customer.companyAddressCountry,
            signedUpAt: customer.signedUpAt,
            storage: customer.storage,
            havePaid: customer.havePaid,
            numberOfFiles: customer.files.length,
            totalUsedSizeBytes: customer.files.reduce((acc, file) => acc + file.sizeBytes, 0),
        })),
    });
}
