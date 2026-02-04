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

async function sendShopPendingEmail({ to, name, shopName }) {
    if (!transporter) {
        console.warn('SMTP credentials not configured, skipping shop pending email.');
        return;
    }

    if (!to) {
        console.warn('Missing recipient, skipping shop pending email.');
        return;
    }

    try {
        await transporter.sendMail({
            from: `Adsolutions Electronics <${process.env.SMTP_FROM}>`,
            to,
            subject: 'Shop Registration Received - Pending Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 40px 20px;">
                  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #232F3E; margin-top: 0;">Thank you${name ? `, ${name}` : ''}!</h1>
                    <p style="color: #555; font-size: 15px;">Your shop registration for <strong>${shopName || 'your shop'}</strong> has been received successfully.</p>
                    <div style="background: #FFF8E1; border-left: 4px solid #FFB300; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #7A6200; margin: 0; font-size: 14px;"><strong>⏳ Pending Verification</strong></p>
                      <p style="color: #7A6200; margin: 10px 0 0 0; font-size: 13px;">Our team is reviewing your application. This usually takes 1-2 business days.</p>
                    </div>
                    <p style="color: #555; font-size: 15px;">We'll notify you by email once your shop is verified and ready to accept orders.</p>
                    <p style="color: #777; font-size: 13px; margin-top: 30px;">If you have any questions, please contact our support team.</p>
                  </div>
                </div>
            `,
        });
    } catch (error) {
        console.error('Error sending shop pending email:', error);
    }
}

async function sendShopVerifiedEmail({ to, name, shopName }) {
    if (!transporter) {
        console.warn('SMTP credentials not configured, skipping shop verified email.');
        return;
    }

    if (!to) {
        console.warn('Missing recipient, skipping shop verified email.');
        return;
    }

    const dashboardLink = `${getBaseUrl()}/shop/dashboard`;

    try {
        await transporter.sendMail({
            from: `Adsolutions Electronics <${process.env.SMTP_FROM}>`,
            to,
            subject: '🎉 Your Shop Has Been Verified!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 40px 20px;">
                  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #232F3E; margin-top: 0;">Congratulations${name ? `, ${name}` : ''}! 🎉</h1>
                    <p style="color: #555; font-size: 15px;">Great news! Your shop <strong>${shopName || 'your shop'}</strong> has been verified and is now active.</p>
                    <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #2E7D32; margin: 0; font-size: 14px;"><strong>✓ Shop Verified</strong></p>
                      <p style="color: #2E7D32; margin: 10px 0 0 0; font-size: 13px;">You can now start adding products and receiving orders!</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${dashboardLink}" style="background: linear-gradient(to bottom, #FFD814, #F7CA00); color: #0F1111; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Shop Dashboard</a>
                    </div>
                    <p style="color: #777; font-size: 13px; margin-top: 30px;">Welcome to our marketplace! We're excited to have you on board.</p>
                  </div>
                </div>
            `,
        });
    } catch (error) {
        console.error('Error sending shop verified email:', error);
    }
}

async function sendRoleChangeEmail({ to, name, newRole }) {
    if (!transporter) {
        console.warn('SMTP credentials not configured, skipping role change email.');
        return;
    }

    if (!to) {
        console.warn('Missing recipient, skipping role change email.');
        return;
    }

    const roleLabels = {
        'ADMIN': 'Administrator',
        'CUSTOMER': 'Customer',
        'SHOP_OWNER': 'Shop Owner',
        'SHOP_STAFF': 'Shop Staff'
    };
    const roleLabel = roleLabels[newRole] || newRole;

    try {
        await transporter.sendMail({
            from: `Adsolutions Electronics <${process.env.SMTP_FROM}>`,
            to,
            subject: 'Your Account Role Has Been Updated',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 40px 20px;">
                  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #232F3E; margin-top: 0;">Account Update</h1>
                    <p style="color: #555; font-size: 15px;">Hello${name ? ` ${name}` : ''},</p>
                    <p style="color: #555; font-size: 15px;">Your account role has been updated by an administrator.</p>
                    <div style="background: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #1565C0; margin: 0; font-size: 14px;"><strong>New Role: ${roleLabel}</strong></p>
                    </div>
                    <p style="color: #777; font-size: 13px; margin-top: 30px;">If you did not expect this change, please contact our support team immediately.</p>
                  </div>
                </div>
            `,
        });
    } catch (error) {
        console.error('Error sending role change email:', error);
    }
}

module.exports = {
    sendEmailVerificationEmail,
    sendShopPendingEmail,
    sendShopVerifiedEmail,
    sendRoleChangeEmail,
};
