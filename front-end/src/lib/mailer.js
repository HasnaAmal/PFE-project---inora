// lib/mailer.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // e.g., "smtp.gmail.com" or SendGrid SMTP
  port: Number(process.env.SMTP_PORT),  // 465 for SSL or 587 for TLS
  secure: process.env.SMTP_SECURE === 'true', // true ila 465, false ila 587
  auth: {
    user: process.env.EMAIL_USER,       // email li bghiti tsend menno
    pass: process.env.EMAIL_PASS        // Gmail App Password / SMTP password
  },
  connectionTimeout: 20000               // 20s timeout
});

// Optional test function
export const testMailer = async () => {
  try {
    await transporter.sendMail({
      from: `"Inora" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test email',
      text: 'This is a test email from Nodemailer'
    });
    console.log('✅ Test email sent');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};