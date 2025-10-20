import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Configure email transporter (Microsoft O365 SMTP as per spec)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Architecture.lk" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    })
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  verification: (verificationUrl: string, firstName: string) => ({
    subject: 'Verify your Architecture.lk account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Architecture.lk!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering with Architecture.lk. Please verify your email address to complete your account setup.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk - AI-Powered House Design Platform</p>
      </div>
    `,
    text: `Welcome to Architecture.lk! Please verify your email by visiting: ${verificationUrl}`
  }),

  paymentReceipt: (firstName: string, planName: string, points: number, amount: number) => ({
    subject: 'Payment Receipt - Architecture.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Confirmed!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for your purchase. Your payment has been processed successfully.</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Purchase Details</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Points Added:</strong> ${points}</p>
          <p><strong>Amount:</strong> LKR ${amount.toLocaleString()}</p>
        </div>
        <p>You can now use your points to generate amazing house designs with AI!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Designing</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk - AI-Powered House Design Platform</p>
      </div>
    `,
    text: `Payment confirmed! You've received ${points} points for LKR ${amount}. Visit ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard to start designing.`
  }),

  consultationConfirmation: (firstName: string, architectName: string, consultationDate: string, meetingUrl?: string) => ({
    subject: 'Architect Consultation Confirmed - Architecture.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Consultation Confirmed!</h2>
        <p>Hi ${firstName},</p>
        <p>Your architect consultation has been successfully scheduled.</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Consultation Details</h3>
          <p><strong>Architect:</strong> ${architectName}</p>
          <p><strong>Date & Time:</strong> ${consultationDate}</p>
          ${meetingUrl ? `<p><strong>Meeting Link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
        </div>
        <p>Please prepare your design requirements and any questions you'd like to discuss with the architect.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk - AI-Powered House Design Platform</p>
      </div>
    `,
    text: `Consultation confirmed with ${architectName} on ${consultationDate}. ${meetingUrl ? `Meeting link: ${meetingUrl}` : ''}`
  }),

  adminAlert: (alertType: string, details: string) => ({
    subject: `Admin Alert: ${alertType} - Architecture.lk`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Admin Alert</h2>
        <p><strong>Alert Type:</strong> ${alertType}</p>
        <p><strong>Details:</strong></p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <pre style="white-space: pre-wrap; font-family: monospace;">${details}</pre>
        </div>
        <p>Please review and take appropriate action.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk Admin System</p>
      </div>
    `,
    text: `Admin Alert: ${alertType}\n\n${details}`
  })
}

// Helper function to send verification email
export async function sendVerificationEmail(email: string, firstName: string, verificationUrl: string): Promise<boolean> {
  const template = emailTemplates.verification(verificationUrl, firstName)
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

// Helper function to send payment receipt
export async function sendPaymentReceipt(email: string, firstName: string, planName: string, points: number, amount: number): Promise<boolean> {
  const template = emailTemplates.paymentReceipt(firstName, planName, points, amount)
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

// Helper function to send consultation confirmation
export async function sendConsultationConfirmation(email: string, firstName: string, architectName: string, consultationDate: string, meetingUrl?: string): Promise<boolean> {
  const template = emailTemplates.consultationConfirmation(firstName, architectName, consultationDate, meetingUrl)
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

// Helper function to send admin alerts
export async function sendAdminAlert(alertType: string, details: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@architecture.lk'
  const template = emailTemplates.adminAlert(alertType, details)
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}
