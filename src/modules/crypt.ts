import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const defaultHashAlgorithm = <string>process.env.HASH_ALGO;
const passwordHashAlgorithm = process.env.PASSWORD_HASH_ALGO || defaultHashAlgorithm;

type HashAlgorithm = {
    hash: (value: string) => Promise<string>;
    verify: (value: string, hash: string) => Promise<boolean>;
};

const supportedHashAlgorithms: { [key: string]: HashAlgorithm } = {
    bcrypt: {
        hash: (value) => bcrypt.hash(value, 10),
        verify: (value, hash) => bcrypt.compare(value, hash),
    },
    ...crypto.getHashes().reduce((acc, hashAlgorithm) => {
        acc[hashAlgorithm] = {
            hash: (value) => new Promise((resolve) => {
                resolve(crypto.createHash(hashAlgorithm).update(value).digest('hex'));
            }),
            verify: (value, hash) => new Promise((resolve) => {
                resolve(crypto.createHash(hashAlgorithm).update(value).digest('hex') === hash);
            }),
        };
        return acc;
    }, {} as { [key: string]: HashAlgorithm }),
};

const hash = (value: string, algorithm: string): Promise<string> => {
    return supportedHashAlgorithms[algorithm].hash(value);
};

const verify = (value: string, hash: string, algorithm: string): Promise<boolean> => {
    return supportedHashAlgorithms[algorithm].verify(value, hash);
};

const forDefault = (): HashAlgorithm => supportedHashAlgorithms[defaultHashAlgorithm];

const forPassword = (): HashAlgorithm => supportedHashAlgorithms[passwordHashAlgorithm];

export default {
    supportedHashAlgorithms,
    hash,
    verify,
    forDefault,
    forPassword,
};
