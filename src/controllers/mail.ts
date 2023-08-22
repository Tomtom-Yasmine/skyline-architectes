import ejs from 'ejs';
import {
    createTransport,
    SendMailOptions,
} from 'nodemailer';
import {
    resolve,
} from 'node:path';

export const renderTemplate = (template: string, data: Record<string, unknown>) => {
    return ejs.renderFile(
        resolve('public/templates', `${template}.ejs`),
        data,
    );
};

export const sendMail = async ({
    to,
    cc,
    bcc,
    subject,
    template,
    data,
    html,
    text,
    attachments,
    replyTo,
}: { template?: string; data?: Record<string, unknown>; } & SendMailOptions) => {
    if (template) {
        html = await renderTemplate(template, data || {});
    }
    
    const transporter = createTransport({
        host: process.env.MAIL_SMTP_HOST,
        port: Number(process.env.MAIL_SMTP_PORT),
        secure: process.env.MAIL_SMTP_IS_SECURE === 'true',
        auth: {
            user: process.env.MAIL_SMTP_USERNAME,
            pass: process.env.MAIL_SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: {
            name: process.env.MAIL_FROM_NAME as string,
            address: process.env.MAIL_FROM_ADDRESS as string,
        },
        to,
        cc,
        bcc,
        subject,
        html,
        text,
        attachments,
        replyTo,
    });
};
