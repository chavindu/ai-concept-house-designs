import { generateRandomToken } from './jwt'
import { hashPassword } from './password'
import { createPasswordResetToken, getPasswordResetToken, deletePasswordResetToken } from '@/lib/database/server'
import { updateUser } from '@/lib/database/server'
import { sendEmail } from '@/lib/email-service'

const PASSWORD_RESET_TOKEN_EXPIRES_HOURS = 1

/**
 * Create a password reset token for a user
 * @param userId - User ID
 * @param email - User's email address
 * @returns Password reset token
 */
export async function createPasswordResetTokenForUser(userId: string, email: string): Promise<string> {
  try {
    // Generate a random token
    const token = generateRandomToken(32)
    
    // Calculate expiration date (1 hour from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TOKEN_EXPIRES_HOURS)
    
    // Store token in database
    await createPasswordResetToken({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })
    
    // Send password reset email
    await sendPasswordResetEmail(email, token)
    
    return token
  } catch (error) {
    console.error('Error creating password reset token:', error)
    throw new Error('Failed to create password reset token')
  }
}

/**
 * Verify a password reset token
 * @param token - Password reset token
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const resetToken = await getPasswordResetToken(token)
    
    if (!resetToken) {
      return null
    }
    
    return resetToken.user_id
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    throw new Error('Failed to verify password reset token')
  }
}

/**
 * Reset user password using token
 * @param token - Password reset token
 * @param newPassword - New password
 * @returns Success status
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  try {
    // Verify token
    const userId = await verifyPasswordResetToken(token)
    
    if (!userId) {
      return false
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword)
    
    // Update user password
    await updateUser(userId, {
      password_hash: passwordHash,
    })
    
    // Delete the token after successful password reset
    await deletePasswordResetToken(token)
    
    return true
  } catch (error) {
    console.error('Error resetting password:', error)
    throw new Error('Failed to reset password')
  }
}

/**
 * Send password reset email to user
 * @param email - User's email address
 * @param token - Password reset token
 */
async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
    
    const emailContent = {
      to: email,
      subject: 'Reset Your Password - Architecture.lk',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your Architecture.lk account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p style="color: #666; font-size: 14px;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Architecture.lk - AI-Powered House Design Platform
          </p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You requested to reset your password for your Architecture.lk account.
        
        Click this link to reset your password: ${resetUrl}
        
        This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        
        Architecture.lk - AI-Powered House Design Platform
      `,
    }
    
    await sendEmail(emailContent)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

/**
 * Change user password (for authenticated users)
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success status
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const { getUserById } = await import('@/lib/database/server')
    const { verifyPassword } = await import('./password')
    
    // Get user
    const user = await getUserById(userId)
    
    if (!user || !user.password_hash) {
      return false
    }
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash)
    
    if (!isCurrentPasswordValid) {
      return false
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword)
    
    // Update user password
    await updateUser(userId, {
      password_hash: passwordHash,
    })
    
    return true
  } catch (error) {
    console.error('Error changing password:', error)
    throw new Error('Failed to change password')
  }
}

/**
 * Check if password reset token exists and is valid
 * @param token - Password reset token
 * @returns Boolean indicating if token is valid
 */
export async function isPasswordResetTokenValid(token: string): Promise<boolean> {
  try {
    const resetToken = await getPasswordResetToken(token)
    return !!resetToken
  } catch (error) {
    console.error('Error checking password reset token:', error)
    return false
  }
}
