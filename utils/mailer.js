import nodemailer from 'nodemailer';
import fs from 'fs';
import { EMAIL_TEMPLATES } from './constants.js';
import { generateComments } from './helpers.js';

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

function bindEmailData(type, data, htmlString) {
    let resultHTML = htmlString;

    // Conditional Email Variables
    switch (type) {
        case EMAIL_TEMPLATES.LOGIN_CREDENTIALS:
            resultHTML = replaceAll(resultHTML, '{{email}}', data?.email);
            resultHTML = replaceAll(resultHTML, '{{password}}', data?.password);
            resultHTML = replaceAll(resultHTML, '{{frontendUrl}}', process.env.FRONTEND_URL);
            break;

        case EMAIL_TEMPLATES.APPROVED_ACTIVITY:
            resultHTML = replaceAll(resultHTML, '{{activityTitle}}', data?.activityTitle);
            resultHTML = replaceAll(resultHTML, '{{approvedByRole}}', data?.approvedByRole);
            resultHTML = replaceAll(resultHTML, '{{frontendUrl}}', process.env.FRONTEND_URL);
            break;

        case EMAIL_TEMPLATES.REJECTED_ACTIVITY:
            resultHTML = replaceAll(resultHTML, '{{activityTitle}}', data?.activityTitle);
            resultHTML = replaceAll(resultHTML, '{{rejectedByRole}}', data?.rejectedByRole);
            resultHTML = replaceAll(resultHTML, '{{comments}}', generateComments(data?.comments));
            resultHTML = replaceAll(resultHTML, '{{frontendUrl}}', process.env.FRONTEND_URL);
            break;

        default:
            break;
    }

    return resultHTML;
}

function generateHTMLString(type, data) {
    let result = "";

    try {
        const files = fs.readFileSync(`utils/email-templates/${type}.html`);
        let fileString = files.toString('utf8');
        result = bindEmailData(type, data, fileString);
    } catch (error) {
        console.log(error);
    }

    return result;
};

export const sendMail = async ({ html, templateRef, data, to, subject }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: html ?? generateHTMLString(templateRef, data),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.log(error);
    }
};

export const fileExists = async (path) => {
    try {
        await fs.promises.access(path);
        return true;
    } catch (error) {
        return false;
    }
}