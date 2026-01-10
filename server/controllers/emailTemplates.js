// emailTemplates.js
export const userWelcomeTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Welcome to Soro!</title></head>
<body style="font-family: Arial, sans-serif; background: #F4F6FA; margin:0; padding:20px;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" 
         style="background:#FFFFFF; border-radius:8px; overflow:hidden;">
    <tr><td align="center" style="padding:20px;">
      <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png" alt="Soro Logo" width="120" style="margin-bottom:20px;"/>
      <h1 style="color:#30459D; margin:0;">Welcome to Soro!</h1>
    </td></tr>
    <tr><td style="padding:0 30px 20px;">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for registering with <strong>Soro</strong>! We’re thrilled to have you on board.</p>
      <div style="background:#F8FAFF; padding:20px; border-radius:6px; margin:20px 0;">
        <h2 style="margin-top:0; color:#30459D;">Get Started</h2>
        <p>Click below to log in and explore our mental health tools and resources:</p>
        <p style="text-align:center; margin:20px 0;">
          <a href="https://soro.care/login"
             style="background-color:#2D8CFF; color:#FFF; text-decoration:none; 
                    padding:12px 24px; border-radius:4px; font-weight:bold;">
            Log In to Your Account
          </a>
        </p>
      </div>
      <p>If you have questions, reply to this email or visit our 
         <a href="https://soro.care/login" style="color:#30459D;">Help Center</a>.</p>
      <p>Cheers,<br/>The Soro Team</p>
    </td></tr>
    <tr>
      <td align="center" style="font-size:12px; color:#888; padding:10px 30px 20px;">
        © 2025 Soro. All rights reserved.<br/>
        <a href="https://soro.care/login" style="color:#888; text-decoration:underline;">
          Unsubscribe
        </a>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const professionalWelcomeTemplate = ({
  name, isPeerCounselor, counselorId
}) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Welcome, Professional!</title></head>
<body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:5px;">
  <table align="center" width="600" cellpadding="0" cellspacing="0"
         style="background:#FFF;border-radius:8px;overflow:hidden;">
    <tr><td align="center" style="padding:20px;">
      <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png" alt="Soro Logo" width="120" style="margin-bottom:20px;"/>
      <h1 style="color:#30459D;margin:0;">Welcome to Soro!</h1>
    </td></tr>
    <tr><td style="padding:0 30px 20px;">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We’re excited to have you join us as a 
         <strong>${isPeerCounselor ? 'Peer Counselor' : 'Professional'}</strong>!</p>
      <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
        <h2 style="margin-top:0;color:#30459D;">Your Dashboard</h2>
        <p>Log in to manage your availability, view sessions, and connect with clients.</p>
        <p style="text-align:center;margin:20px 0;">
          <a href="https://soro.care/login"
             style="background-color:#2D8CFF;color:#FFF;text-decoration:none;
                    padding:12px 24px;border-radius:4px;font-weight:bold;">
            Access Your Dashboard
          </a>
        </p>
        ${isPeerCounselor ? `
        <div style="background:#FFF8E6;padding:15px;border-radius:6px;margin-top:20px;">
          <p style="margin:0;">
            <strong>Peer Counselor ID:</strong> ${counselorId}
          </p>
        </div>` : ''}
      </div>
      <p>Need help? Reply or visit our 
         <a href="https://soro.care/login" style="color:#30459D;">Support Center</a>.</p>
      <p>Best regards,<br/>The Soro Team</p>
    </td></tr>
    <tr>
      <td align="center" style="font-size:12px;color:#888;padding:10px 30px 20px;">
        © 2025 Soro. All rights reserved.<br/>
        <a href="https://soro.care/login" style="color:#888;text-decoration:underline;">
          Unsubscribe
        </a>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const otpTemplate = ({
  name, otp
}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #30459D;
            margin-bottom: 10px;
        }
        .otp-container {
            background-color: #f5f7ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 32px;
            letter-spacing: 5px;
            color: #30459D;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SORO</div>
        <h2>Email Verification</h2>
    </div>
    
    <p>Hello ${name},</p>
    
    <p>Thank you for registering with Soro. Please use the following OTP to verify your email address:</p>
    
    <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <p>This code will expire in 10 minutes.</p>
    </div>
    
    <p>If you didn't request this, you can safely ignore this email.</p>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} Soro. All rights reserved.</p>
    </div>
</body>
</html>
`;

// In your emailTemplates.js file
export const passwordResetTemplate = ({ name, otp }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #30459D;
            margin-bottom: 10px;
        }
        .otp-container {
            background-color: #f5f7ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 32px;
            letter-spacing: 5px;
            color: #30459D;
            font-weight: bold;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #30459D;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SORO</div>
        <h2>Password Reset Request</h2>
    </div>
    
    <p>Hello ${name},</p>
    
    <p>We received a request to reset your password. Please use the following OTP to proceed:</p>
    
    <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <p>This code will expire in 10 minutes.</p>
    </div>
    
    <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/reset-password" class="button">
            Reset Password
        </a>
    </p>
    
    <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} Soro. All rights reserved.</p>
    </div>
</body>
</html>
`;

export const passwordResetConfirmationTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #30459D; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success { color: #4CAF50; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Updated Successfully</h2>
        </div>
        <div class="content">
            <p>Hello ${name},</p>
            <p class="success">Your Soro account password has been successfully reset.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Soro. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// In your email templates file
export const passwordChangeConfirmationTemplate = ({ name }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #30459D;">Password Changed Successfully</h2>
            <p>Hello ${name},</p>
            <p>Your password was recently changed. If you didn't make this change, please contact support immediately.</p>
            <p>Thanks,<br>The Soro Team</p>
        </div>
    `;
};

export const contactFormTemplate  = ({ name, email, message, isAuthenticated }) =>  {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #30459D;">New Contact Form Submission</h2>
      <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> ${name} ${isAuthenticated ? '(Registered User)' : ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${isAuthenticated ? `<p><strong>User Type:</strong> Registered User</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-line; background: white; padding: 10px; border-radius: 4px;">
          ${message}
        </p>
      </div>
      <p style="color: #666;">Please respond to this inquiry within 24 hours.</p>
    </div>
  `;
}