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
