// lib/mailer.js
import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 globally
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',  // hadi ghadi tkon false daba
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 20000,
  tls: {
    rejectUnauthorized: false  // Temporaire pour test
  }
});

export const testMailer = async () => {
  try {
    await transporter.sendMail({
      from: `"Inora" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test email',
      text: 'Test from Railway'
    });
    console.log('✅ Test email sent');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};