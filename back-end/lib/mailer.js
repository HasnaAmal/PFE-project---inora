// lib/mailer.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const transporter = {
  sendMail: async (options) => {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_USER || 'onboarding@resend.dev',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      
      if (error) throw error;
      console.log('✅ Email sent:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Email error:', error);
      throw error;
    }
  }
};