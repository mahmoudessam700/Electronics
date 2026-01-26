import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not configured, skipping email.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Adsolutions Electronics" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "Welcome to Adsolutions!",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for creating an account with Adsolutions Electronics.</p>
          <p>We're excited to have you on board. You can now browse our premium selection of electronic components and devices.</p>
          <br/>
          <p>Happy Shopping!</p>
          <p>The Adsolutions Team</p>
        </div>
      `,
        });
        console.log("Welcome email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        // Don't throw, we don't want to break the signup flow
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not configured, skipping email.');
        return;
    }

    const resetLink = `https://electronics.adsolutions-eg.com/reset-password?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: `"Adsolutions Electronics" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "Reset your password",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Password Request</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p>
            <a href="${resetLink}" style="background-color: #FFD814; color: #0F1111; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </p>
          <p>Or copy this link: ${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't ask for this, you can safely ignore this email.</p>
        </div>
      `,
        });
        console.log("Reset email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending reset email:", error);
        throw error; // Throw so API knows it failed
    }
}

export async function sendEmailVerificationEmail(email: string, name: string, token: string) {
    if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not configured, skipping email.');
        return;
    }

    const verifyLink = `https://electronics.adsolutions-eg.com/verify-email?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: `"Adsolutions Electronics" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "Verify your email address",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 40px 20px;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #232F3E; margin: 0;">Welcome to Adsolutions!</h1>
            </div>
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">Thank you for creating an account. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background: linear-gradient(to bottom, #FFD814, #F7CA00); color: #0F1111; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #888; font-size: 12px;">Or copy this link: ${verifyLink}</p>
            <p style="color: #888; font-size: 12px;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px; text-align: center;">If you didn't create this account, you can safely ignore this email.</p>
          </div>
        </div>
      `,
        });
        console.log("Verification email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
}
