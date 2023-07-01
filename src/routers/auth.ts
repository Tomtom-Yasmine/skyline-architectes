import {
    Router,
} from 'express';
import {
    PrismaClient,
} from '@prisma/client';
import {
    PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import jwt from '../modules/jwt';

const prisma = new PrismaClient();

const router = Router();

router.post('/signup', async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash,
        companyName,
        companySiret,
        companyAddressNumber,
        companyAddressStreet,
        companyAddressAdditional,
        companyAddressCity,
        companyAddressZipCode,
        companyAddressCountry,
    } = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                passwordHash,
                companyName,
                companySiret,
                companyAddressNumber,
                companyAddressStreet,
                companyAddressAdditional,
                companyAddressCity,
                companyAddressZipCode,
                companyAddressCountry,
            },
        });

        if (! user) {
            res.status(500).json({
                message: 'ERR:INTERNAL_SERVER_ERROR',
            });
            return;
        }
    
        const token = jwt.sign(
            {},
            {
                subject: user.id,
                expiresIn: '365d',
            }
        );
        res.json({
            sessionToken: token,
        });
        prisma.log.create({
            data: {
                type: 'USER_SIGNUP',
                ipAddressHash: req.ipHash,
                userId: user.id,
                logDate: new Date(),
                message: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    passwordHash,
                    companyName,
                    companySiret,
                    companyAddressNumber,
                    companyAddressStreet,
                    companyAddressAdditional,
                    companyAddressCity,
                    companyAddressZipCode,
                    companyAddressCountry,
                }),
            },
        });
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
              res.status(409).json({
                  message: 'ERR:USER_ALREADY_EXISTS',
              });
              return;
        }
        
        res.status(500).json({
            message: 'ERR:INTERNAL_SERVER_ERROR',
        });
    }
});

router.post('/login', async (req, res) => {
    const {
        emailAddress,
        passwordHash,
    } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: emailAddress,
        },
    });

    if (! user || user.passwordHash !== passwordHash) {
        res.status(401).json({
            message: 'ERR:INVALID_CREDENTIALS',
        });
        prisma.log.create({
            data: {
                type: 'USER_LOGIN_FAIL',
                ipAddressHash: req.ipHash,
                logDate: new Date(),
                message: JSON.stringify({
                    emailAddress,
                    passwordHash,
                }),
            },
        });
        return;
    }

    const token = jwt.sign(
        {},
        {
            subject: user.id,
            expiresIn: '365d',
        }
    );
    res.json({
        sessionToken: token,
    });
    prisma.log.create({
        data: {
            type: 'USER_LOGIN_SUCCESS',
            ipAddressHash: req.ipHash,
            userId: user.id,
            logDate: new Date(),
            message: JSON.stringify({
                emailAddress,
                passwordHash,
            }),
        },
    });
});

export default router;
