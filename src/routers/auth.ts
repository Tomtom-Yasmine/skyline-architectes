import {
    Router,
} from 'express';
import {
    PrismaClient,
} from '@prisma/client';
import {
    PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import crypt from '../modules/crypt';
import jwt from '../modules/jwt';
import { updatePassword } from '../controllers/auth';
import { requireAuthentication } from '../middleware';
import {
    sendMail,
} from '../controllers/mail';

const prisma = new PrismaClient();

const router = Router();

router.post('/signup', async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
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
        const passwordHash = await crypt.forPassword().hash(password);
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
                havePaid: false,
                storage: 0,
            },
        });

        if (! user) {
            res.status(500).json({
                message: 'ERR:INTERNAL_SERVER_ERROR',
            });
            return;
        }

        const token = jwt.forUserSession(user).sign();
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
                    havePaid: false,
                    storage : 0,
                }),
            },
        });

        sendMail({
            to: email,
            subject: 'Bienvenue chez Skyline Architectes',
            template: 'welcome',
            data: {
                firstName,
                lastName,
                email,
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
        email,
        password,
    } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (! user || ! await crypt.forPassword().verify(password, user.passwordHash)) {
        res.status(401).json({
            message: 'ERR:INVALID_CREDENTIALS',
        });
        prisma.log.create({
            data: {
                type: 'USER_LOGIN_FAIL',
                ipAddressHash: req.ipHash,
                logDate: new Date(),
                message: JSON.stringify({
                    email,
                    passwordHash: await crypt.forPassword().hash(password),
                }),
            },
        });
        return;
    }

    const token = jwt.forUserSession(user).sign();
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
                email,
            }),
        },
    });
});

router.post('/update-password', requireAuthentication(), updatePassword);

export default router;
