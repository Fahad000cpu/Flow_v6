// src/app/actions/send-email.ts
'use server';

import nodemailer from 'nodemailer';

type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// IMPORTANT: These values should be stored in your environment variables (.env.local)
// for security and to avoid committing sensitive data to your repository.
const smtpConfig = {
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: (process.env.EMAIL_SERVER_PORT === '465'), // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};

const fromEmail = process.env.EMAIL_FROM;

export async function sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
  // Verify that all required environment variables are set
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass || !fromEmail) {
    console.error("Email server environment variables are not configured.");
    return { success: false, error: 'Email service is not configured. Please contact the administrator.' };
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.verify();
    console.log("SMTP server connection verified.");
  } catch (error) {
    console.error("SMTP server connection verification failed:", error);
    return { success: false, error: 'Failed to connect to email server.' };
  }

  const mailOptions = {
    from: fromEmail,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${payload.to}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending email to ${payload.to}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred while sending the email.' };
  }
}
