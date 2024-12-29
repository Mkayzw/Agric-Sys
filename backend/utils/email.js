const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class Email {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });
    }

    async loadTemplate(templateName) {
        const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`);
        const template = await fs.readFile(templatePath, 'utf-8');
        return handlebars.compile(template);
    }

    async send({ to, subject, templateName, data }) {
        try {
            // Load and compile template
            const template = await this.loadTemplate(templateName);
            const html = template(data);

            // Convert HTML to text as fallback
            const text = htmlToText(html, {
                wordwrap: 130,
                ignoreImage: true
            });

            // Send email
            const mailOptions = {
                from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                to,
                subject,
                html,
                text
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            }

            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }

    async sendVerification(user, verificationUrl) {
        await this.send({
            to: user.email,
            subject: 'Verify Your Email Address',
            templateName: 'verification',
            data: {
                name: user.firstName,
                verificationUrl,
                supportEmail: process.env.SUPPORT_EMAIL
            }
        });
    }

    async sendPasswordReset(user, resetUrl) {
        await this.send({
            to: user.email,
            subject: 'Password Reset Request',
            templateName: 'password-reset',
            data: {
                name: user.firstName,
                resetUrl,
                supportEmail: process.env.SUPPORT_EMAIL,
                expiryTime: '30 minutes'
            }
        });
    }

    async sendWelcome(user) {
        await this.send({
            to: user.email,
            subject: 'Welcome to AgriConnect!',
            templateName: 'welcome',
            data: {
                name: user.firstName,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
                supportEmail: process.env.SUPPORT_EMAIL
            }
        });
    }
}

module.exports = new Email(); 