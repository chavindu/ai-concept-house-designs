import { generateRandomToken } from './jwt'
import { createVerificationToken, getVerificationToken, deleteVerificationToken } from '@/lib/database/server'
import { sendEmail } from '@/lib/email-service'

const VERIFICATION_TOKEN_EXPIRES_HOURS = 24

/**
 * Create an email verification token for a user
 * @param userId - User ID
 * @param email - User's email address
 * @returns Verification token
 */
export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  try {
    // Generate a random token
    const token = generateRandomToken(32)
    
    // Calculate expiration date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS)
    
    // Store token in database
    await createVerificationToken({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })
    
    // Send verification email
    await sendVerificationEmail(email, token)
    
    return token
  } catch (error) {
    console.error('Error creating email verification token:', error)
    throw new Error('Failed to create email verification token')
  }
}

/**
 * Verify an email verification token
 * @param token - Verification token
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  try {
    const verificationToken = await getVerificationToken(token)
    
    if (!verificationToken) {
      return null
    }
    
    // Delete the token after successful verification
    await deleteVerificationToken(token)
    
    return verificationToken.user_id
  } catch (error) {
    console.error('Error verifying email token:', error)
    throw new Error('Failed to verify email token')
  }
}

/**
 * Send verification email to user
 * @param email - User's email address
 * @param token - Verification token
 */
async function sendVerificationEmail(email: string, token: string): Promise<void> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    
    const emailContent = {
      to: email,
      subject: 'Verify Your Email - Architecture.lk',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Architecture.lk!</h2>
          <p>Thank you for registering with Architecture.lk. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create an account with Architecture.lk, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Architecture.lk - AI-Powered House Design Platform
          </p>
        </div>
      `,
      text: `
        Welcome to Architecture.lk!
        
        Thank you for registering with Architecture.lk. Please verify your email address to complete your registration.
        
        Click this link to verify your email: ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create an account with Architecture.lk, please ignore this email.
        
        Architecture.lk - AI-Powered House Design Platform
      `,
    }
    
    await sendEmail(emailContent)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Resend verification email
 * @param userId - User ID
 * @param email - User's email address
 */
export async function resendVerificationEmail(userId: string, email: string): Promise<void> {
  try {
    // Delete any existing verification tokens for this user
    // This prevents multiple verification emails
    await deleteVerificationToken(userId)
    
    // Create new verification token and send email
    await createEmailVerificationToken(userId, email)
  } catch (error) {
    console.error('Error resending verification email:', error)
    throw new Error('Failed to resend verification email')
  }
}

/**
 * Check if user's email is verified
 * @param userId - User ID
 * @returns Boolean indicating if email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const { getUserById } = await import('@/lib/database/server')
    const user = await getUserById(userId)
    
    return user?.email_verified || false
  } catch (error) {
    console.error('Error checking email verification status:', error)
    return false
  }
}
