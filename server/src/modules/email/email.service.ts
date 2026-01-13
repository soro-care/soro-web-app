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

  async sendContactForm(name: string, email: string, message: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: 'support@soro.care',
        subject: 'New Contact Form Submission',
        html: `
          <h2>New Contact Form Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    } catch (error) {
      console.error('Error sending contact form email:', error);
    }
  }

  // ============================================
  // PSN EMAIL TEMPLATES (REFORMATTED)
  // ============================================

  psnApplicationReceivedTemplate(name: string, applicationId: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>✅ PSN Application Received - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">✅ Application Received</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Thank you for applying to join the <strong>Peer Support Network (PSN)</strong>!
              </p>
              
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Application Details</h2>
                <p style="margin:5px 0;font-size:15px;">
                  <strong>Application ID:</strong> ${applicationId}<br>
                  <strong>Status:</strong> Under Review<br>
                  <strong>Review Time:</strong> 3-5 business days
                </p>
              </div>
              
              <div style="background:#F0F7FF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">What Happens Next?</h2>
                <ol style="margin:0;font-size:15px;">
                  <li>Our team will review your application</li>
                  <li>You'll receive an email with the decision</li>
                  <li>If accepted, complete payment to unlock access</li>
                  <li>Access PSN Portal and training materials</li>
                </ol>
              </div>
              
              <p style="font-size:16px;line-height:1.5;">
                Thank you for your interest in supporting mental health in your community! 💙
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

  psnApplicationAcceptedTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>🎉 PSN Application Accepted - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">🎉 Application Accepted!</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Great news! Your application to join the <strong>Peer Support Network</strong> has been accepted!
              </p>
              
              <div style="background:#E8F5E9;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #4CAF50;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Next Steps:</h2>
                <ol style="margin:0;font-size:15px;">
                  <li><strong>Complete Payment:</strong> Pay the commitment fee to unlock portal access</li>
                  <li><strong>Access PSN Portal:</strong> Begin your 2-month training program</li>
                  <li><strong>Complete Modules:</strong> 10 modules with videos and assessments</li>
                  <li><strong>Get Certified:</strong> Receive your PSN certificate upon completion</li>
                </ol>
              </div>
              
              <p style="text-align:center;margin:25px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://soro.care'}/psn/payment"
                  style="background:#4CAF50;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Complete Payment & Get Started
                </a>
              </p>
              
              <div style="background:#F8FAFF;padding:15px;border-radius:6px;margin:20px 0;">
                <h3 style="margin:0 0 10px;color:#30459D;font-size:16px;">Program Details:</h3>
                <ul style="margin:0;font-size:15px;">
                  <li>Duration: 2 months</li>
                  <li>Modules: 10 training modules</li>
                  <li>Format: Videos + Assessments</li>
                  <li>Certificate: Awarded upon completion</li>
                </ul>
              </div>
              
              <p style="font-size:16px;line-height:1.5;">
                We're excited to have you join our community of peer supporters! 💙
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

  psnApplicationRejectedTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>PSN Application Update - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">Application Update</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Thank you for your interest in joining the Peer Support Network.
              </p>
              
              <div style="background:#FFF3E0;padding:20px;border-radius:6px;margin:20px 0;">
                <p style="font-size:16px;line-height:1.5;">
                  After careful review, we've decided not to move forward with your application at this time. 
                  This decision doesn't reflect your value or potential—we simply have limited spots available.
                </p>
              </div>
              
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Other Ways to Get Involved:</h2>
                <ul style="margin:0;font-size:15px;">
                  <li>Join our community echo rooms to share your story</li>
                  <li>Connect with professional counselors on SORO</li>
                  <li>Participate in our mental health awareness campaigns</li>
                  <li>Reapply in the next cohort (applications open quarterly)</li>
                </ul>
              </div>
              
              <p style="font-size:16px;line-height:1.5;">
                Thank you for your interest in supporting mental health in the community. 💙
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

  psnPaymentConfirmedTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>✅ PSN Payment Confirmed - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">🎓 Portal Access Granted</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Your payment has been confirmed! You now have <strong>full access to the PSN Portal</strong>.
              </p>
              
              <div style="background:#E3F2FD;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Getting Started:</h2>
                <ol style="margin:0;font-size:15px;">
                  <li>Log in to your SORO account</li>
                  <li>Navigate to the PSN Portal</li>
                  <li>Start with Module 1 (unlocked now!)</li>
                  <li>Complete videos, assessments, and track your progress</li>
                </ol>
              </div>
              
              <p style="text-align:center;margin:25px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://soro.care'}/psn/portal"
                  style="background:#2196F3;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Access PSN Portal
                </a>
              </p>
              
              <div style="background:#F8FAFF;padding:15px;border-radius:6px;margin:20px 0;">
                <h3 style="margin:0 0 10px;color:#30459D;font-size:16px;">Important Reminders:</h3>
                <ul style="margin:0;font-size:15px;">
                  <li>New modules unlock weekly based on the timetable</li>
                  <li>Complete all assessments to unlock the next module</li>
                  <li>Build your streak by completing modules consistently</li>
                  <li>Your certificate will be available after completing all 10 modules</li>
                </ul>
              </div>
              
              <p style="font-size:16px;line-height:1.5;">
                Let's start this journey together! 💙
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

  psnModuleUnlockedTemplate(name: string, moduleTitle: string, moduleNumber: number): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>🔓 PSN Module ${moduleNumber} Unlocked - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">📚 New Module Available!</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                Great news! <strong>Module ${moduleNumber}: ${moduleTitle}</strong> is now unlocked and ready for you.
              </p>
              
              <div style="background:#FFF3E0;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #FF9800;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">What's Inside:</h2>
                <ul style="margin:0;font-size:15px;">
                  <li>Training video</li>
                  <li>Pre-assessment</li>
                  <li>Post-assessment</li>
                  <li>Interactive content</li>
                </ul>
              </div>
              
              <p style="text-align:center;margin:25px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://soro.care'}/psn/modules/${moduleNumber}"
                  style="background:#FF9800;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Start Module ${moduleNumber}
                </a>
              </p>
              
              <p style="font-size:16px;line-height:1.5;text-align:center;">
                Keep up the great work! 🔥
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

  psnCertificateTemplate(name: string, certificateData: any): string {
    const completionDate = certificateData.completionDate
      ? new Date(certificateData.completionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>🎉 PSN Certificate Awarded - SORO</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">🏆 Certificate Awarded!</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <p style="font-size:16px;line-height:1.5;">Hi ${name},</p>
              <p style="font-size:16px;line-height:1.5;">
                <strong>Congratulations on completing the Peer Support Network Training Program!</strong>
              </p>
              
              <div style="background:#F3E5F5;padding:30px;border-radius:8px;margin:20px 0;text-align:center;border:3px solid #9C27B0;">
                <h2 style="margin:0 0 15px;color:#9C27B0;font-size:22px;">🏆 Certificate of Completion 🏆</h2>
                <p style="margin:8px 0;font-size:16px;"><strong>Program:</strong> Peer Support Network Training</p>
                <p style="margin:8px 0;font-size:16px;"><strong>Certificate ID:</strong> ${certificateData.certificateId || 'PSN-' + Date.now()}</p>
                <p style="margin:8px 0;font-size:16px;"><strong>Completion Date:</strong> ${completionDate}</p>
                <p style="margin:8px 0;font-size:16px;"><strong>Issued by:</strong> SORO Mental Health Platform</p>
              </div>
              
              <p style="text-align:center;margin:25px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://soro.care'}/psn/certificate"
                  style="background:#9C27B0;color:#FFF;text-decoration:none;
                         padding:12px 24px;border-radius:4px;font-weight:bold;">
                  Download Certificate
                </a>
              </p>
              
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">What's Next?</h2>
                <ul style="margin:0;font-size:15px;">
                  <li>Start accepting peer counseling sessions on SORO</li>
                  <li>Share your certificate on LinkedIn</li>
                  <li>Continue learning and growing as a peer supporter</li>
                  <li>Make a difference in your community!</li>
                </ul>
              </div>
              
              <p style="font-size:16px;line-height:1.5;">
                Thank you for your commitment to mental health support. You're now part of an amazing community of peer supporters making a real impact! 💙
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

  // PSN Email Sending Methods
  async sendPSNApplicationReceived(email: string, name: string, applicationId: string) {
    const html = this.psnApplicationReceivedTemplate(name, applicationId);
    return this.sendEmail(email, '✅ PSN Application Received - SORO', html);
  }

  async sendPSNApplicationAccepted(email: string, name: string) {
    const html = this.psnApplicationAcceptedTemplate(name);
    return this.sendEmail(email, '🎉 Congratulations! PSN Application Accepted', html);
  }

  async sendPSNApplicationRejected(email: string, name: string) {
    const html = this.psnApplicationRejectedTemplate(name);
    return this.sendEmail(email, 'PSN Application Update', html);
  }

  async sendPSNPaymentConfirmed(email: string, name: string) {
    const html = this.psnPaymentConfirmedTemplate(name);
    return this.sendEmail(email, '✅ Payment Confirmed - PSN Portal Access Granted', html);
  }

  async sendPSNModuleUnlocked(
    email: string,
    name: string,
    moduleTitle: string,
    moduleNumber: number,
  ) {
    const html = this.psnModuleUnlockedTemplate(name, moduleTitle, moduleNumber);
    return this.sendEmail(email, `🔓 Module ${moduleNumber} Unlocked: ${moduleTitle}`, html);
  }

  async sendPSNCertificate(email: string, name: string, certificateData: any) {
    const html = this.psnCertificateTemplate(name, certificateData);
    return this.sendEmail(email, '🎉 Congratulations! PSN Certificate Awarded', html);
  }
}
