// src/modules/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'hello@soro.care';

    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY not found. Email service disabled.');
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ Email service initialized');
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn('Email service not configured. Skipping email.');
      return null;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        return null;
      }

      this.logger.log(`✅ Email sent to ${to}`);
      return data;
    } catch (error) {
      this.logger.error('Email sending error:', error);
      return null;
    }
  }

  // EMAIL TEMPLATES

  otpTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>Your Soro Verification Code</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Thanks for signing up! Use this code to verify your email:
              </p>
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;text-align:center;">
                <h2 style="color:#30459D;font-size:32px;margin:0;letter-spacing:5px;">${otp}</h2>
              </div>
              <p style="font-size:14px;color:#666;">
                This code will expire in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  welcomeTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>Welcome to Soro!</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">🎉 Welcome to Soro!</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Your account has been created successfully! We're excited to have you join our community.
              </p>
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">What's Next?</h2>
                <p style="margin:0;font-size:15px;">
                  • Complete your profile<br>
                  • Take the mental health survey<br>
                  • Book your first session<br>
                  • Explore our resources
                </p>
              </div>
              <p style="text-align:center;margin:25px 0;">
                <a href="https://soro.care/dashboard"
                  style="background:#2D8CFF;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Get Started
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  passwordResetTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>Reset Your Password</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">Password Reset Request</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                We received a request to reset your password. Use this code:
              </p>
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;text-align:center;">
                <h2 style="color:#30459D;font-size:32px;margin:0;letter-spacing:5px;">${otp}</h2>
              </div>
              <p style="font-size:14px;color:#666;">
                This code expires in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  passwordResetConfirmationTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>Password Reset Successful</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">✅ Password Reset Successful</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <p style="font-size:14px;color:#666;">
                If you didn't make this change, please contact us immediately.
              </p>
              <p style="text-align:center;margin:25px 0;">
                <a href="https://soro.care/login"
                  style="background:#2D8CFF;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Login Now
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  professionalWelcomeTemplate(data: {
    name: string;
    isPeerCounselor: boolean;
    counselorId?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>Welcome to Soro - Professional</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">🎉 Welcome, ${data.name}!</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">
                Your professional account has been created successfully!
              </p>
              ${
                data.isPeerCounselor
                  ? `
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Your Counselor ID</h2>
                <p style="margin:0;font-size:20px;font-weight:bold;color:#30459D;">
                  ${data.counselorId}
                </p>
                <p style="margin:10px 0 0;font-size:14px;color:#666;">
                  Use this ID for anonymous counseling sessions
                </p>
              </div>
              `
                  : ''
              }
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Next Steps</h2>
                <p style="margin:0;font-size:15px;">
                  • Set your availability<br>
                  • Complete your profile<br>
                  • Start accepting bookings
                </p>
              </div>
              <p style="text-align:center;margin:25px 0;">
                <a href="https://soro.care/dashboard"
                  style="background:#2D8CFF;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Go to Dashboard
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
