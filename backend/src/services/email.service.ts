import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (env.smtpHost) {
      console.log(`[EmailService] Initializing real SMTP connection to ${env.smtpHost}:${env.smtpPort}`);
      this.transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass,
        },
      });
    } else {
      console.log('[EmailService] SMTP settings not configured. Creating Ethereal testing account...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    return this.transporter;
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<{ success: boolean; previewUrl?: string | null; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      const mailOptions = {
        from: env.smtpFrom,
        to: email,
        subject: 'Reset Your RentOps Password',
        text: `You requested a password reset for your RentOps account. Click this link to set a new password: ${resetLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #9c36b5; text-align: center;">RentOps Password Reset</h2>
            <p>Hello,</p>
            <p>You recently requested to reset the password for your RentOps account. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #9c36b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>This link will remain active for testing.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 11px; color: #888; text-align: center;">RentOps Portal - Enterprise Rental Management</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      
      if (!env.smtpHost) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[EmailService] Simulated email sent! Preview URL: ${previewUrl}`);
        return { success: true, previewUrl: previewUrl || null };
      }
      
      console.log(`[EmailService] Real email sent to ${email}. MessageId: ${info.messageId}`);
      return { success: true, previewUrl: null };
    } catch (error: any) {
      console.error('[EmailService] Failed to send email:', error);
      return { success: false, error: error.message || 'SMTP connection failed' };
    }
  }
}

export const emailService = new EmailService();
