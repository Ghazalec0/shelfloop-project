import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendOtp(email: string, otp: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"ShelfLoop 📚" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code - ShelfLoop',
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #111;">Reset Password</h2>
            <p>Your OTP code is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 6px; font-size: 36px;">${otp}</h1>
            <p style="color: #666;">Expires in <b>5 minutes</b>. Don't share this code.</p>
          </div>
        `,
      });
      this.logger.log(`OTP sent to ${email} and otp is ${otp} - MessageID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      console.log(`\n========== OTP FOR ${email} ==========\n${otp}\n====================================\n`);
    }
  }

  async sendContactMessage(name: string, senderEmail: string, message: string) {
    const adminEmail = 'dev.ghazaleco@gmail.com';
    try {
      const info = await this.transporter.sendMail({
        from: `"ShelfLoop Contact" <${process.env.MAIL_USER}>`,
        to: adminEmail,
        replyTo: senderEmail,
        subject: `New Contact Message from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #F59E0B; margin-bottom: 16px;">New Support Inquiry</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Sender Email:</b> ${senderEmail}</p>
            <div style="margin-top: 16px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Contact email from ${senderEmail} delivered to ${adminEmail} - MessageID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send contact message from ${senderEmail}`, error);
      throw error;
    }
  }

  async sendDirectEmail(to: string, subject: string, message: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"ShelfLoop Admin" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #F59E0B; margin-bottom: 16px;">Message from ShelfLoop Admin</h2>
            <div style="margin-top: 16px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Direct email sent to ${to} - MessageID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send direct email to ${to}`, error);
      throw error;
    }
  }
}