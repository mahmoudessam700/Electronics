const nodemailer = require('nodemailer');

const isConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM,
);

const transporter = isConfigured
    ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: (Number(process.env.SMTP_PORT) || 465) === 465,
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          },
      })
    : null;

const getBaseUrl = () => {
    const explicit = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (explicit) return explicit.replace(/\/$/, '');
    return 'https://electronics.adsolutions-eg.com';
};

async function sendEmailVerificationEmail({ to, name, token }) {
    if (!transporter) {
        console.warn('SMTP credentials not configured, skipping verification email.');
        return;
    }

    if (!to || !token) {
        console.warn('Missing recipient or token, skipping verification email.');
        return;
    }

    const verifyLink = `${getBaseUrl()}/verify-email?token=${token}`;

    try {
        await transporter.sendMail({
            from: `Adsolutions Electronics <${process.env.SMTP_FROM}>`,
            to,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 40px 20px;">
                  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #232F3E; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h1>
                    <p style="color: #555; font-size: 15px;">Thanks for creating an account with Adsolutions Electronics. Confirm your email to get started:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${verifyLink}" style="background: linear-gradient(to bottom, #FFD814, #F7CA00); color: #0F1111; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
                    </div>
                    <p style="color: #777; font-size: 12px;">Or copy this link: <a href="${verifyLink}">${verifyLink}</a></p>
                    <p style="color: #bbb; font-size: 12px;">This link expires in 24 hours.</p>
                  </div>
                </div>
            `,
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

module.exports = {
    sendEmailVerificationEmail,
};
