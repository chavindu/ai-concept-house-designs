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
  }),

  designPackageConfirmation: (firstName: string, packageName: string, amount: number, orderId: string) => ({
    subject: 'Design Package Purchase Confirmed - Architecture.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Your Purchase!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for purchasing the ${packageName}. One of our team members will get in touch with you shortly to discuss your project requirements.</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Purchase Details</h3>
          <p><strong>Package:</strong> ${packageName}</p>
          <p><strong>Amount:</strong> LKR ${amount.toLocaleString()}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
        </div>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our team will contact you within 24 hours</li>
          <li>We'll discuss your design requirements in detail</li>
          <li>You'll receive detailed floor plans and elevations</li>
          <li>Digital delivery within 7 days</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Designs</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk - AI-Powered House Design Platform</p>
      </div>
    `,
    text: `Thank you for purchasing ${packageName} for LKR ${amount}. Order ID: ${orderId}. Our team will contact you within 24 hours.`
  }),

  adminDesignPackageNotification: (userDetails: any, designDetails: any, packageName: string, amount: number, orderId: string) => ({
    subject: `New Design Package Purchase - ${packageName} - Architecture.lk`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Design Package Purchase</h2>
        <p>A user has purchased the <strong>${packageName}</strong> package.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Customer Details</h3>
          <p><strong>Name:</strong> ${userDetails.full_name || 'N/A'}</p>
          <p><strong>Email:</strong> ${userDetails.email}</p>
          <p><strong>User ID:</strong> ${userDetails.id}</p>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534;">Purchase Details</h3>
          <p><strong>Package:</strong> ${packageName}</p>
          <p><strong>Amount:</strong> LKR ${amount.toLocaleString()}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment Method:</strong> PayHere</p>
        </div>

        ${designDetails ? `
        <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #a16207;">Design Details</h3>
          <p><strong>Design ID:</strong> ${designDetails.designId || 'N/A'}</p>
          <p><strong>Style:</strong> ${designDetails.style || 'N/A'}</p>
          <p><strong>Building Type:</strong> ${designDetails.buildingType || 'N/A'}</p>
          <p><strong>Perspective:</strong> ${designDetails.perspective || 'N/A'}</p>
          <p><strong>Prompt:</strong> ${designDetails.prompt || 'N/A'}</p>
          ${designDetails.imageUrl ? `<p><strong>Design Image:</strong> <a href="${designDetails.imageUrl}" target="_blank">View Design</a></p>` : ''}
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Admin Panel</a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Architecture.lk Admin System</p>
      </div>
    `,
    text: `New Design Package Purchase: ${packageName} by ${userDetails.full_name} (${userDetails.email}) for LKR ${amount}. Order ID: ${orderId}.`
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

// Helper function to send design package confirmation email
export async function sendDesignPackageConfirmation(email: string, firstName: string, packageName: string, amount: number, orderId: string): Promise<boolean> {
  const template = emailTemplates.designPackageConfirmation(firstName, packageName, amount, orderId)
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

// Helper function to send admin design package notification
export async function sendAdminDesignPackageNotification(userDetails: any, designDetails: any, packageName: string, amount: number, orderId: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bitlab.lk'
  const template = emailTemplates.adminDesignPackageNotification(userDetails, designDetails, packageName, amount, orderId)
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}
