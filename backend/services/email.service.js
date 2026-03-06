import nodemailer from 'nodemailer';

// transporter configuration will rely on environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export async function sendApplicationEmail(options) {
  // options should contain at least: to, subject, text, replyTo?, attachments?
  try {
    const info = await transporter.sendMail(options);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

export default {
  sendApplicationEmail,
};
