import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "Authentication <auth@yourdomain.com>",
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Authentication <auth@yourdomain.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};
