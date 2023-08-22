export const replaceAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const replaceNonAlphanumeric = (str: string, replacement: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, replacement);
};

export const replaceSpaces = (str: string, replacement: string) => {
    return str.replace(/\s+/g, replacement);
};

export const slugifyFilename = (str: string) => {
    return [
        (str: string) => replaceAccents(str),
        (str: string) => str.replace(/[^a-zA-Z0-9\s\-\.]/g, '-'),
    ].reduce((acc, fn) => fn(acc), str);
};
