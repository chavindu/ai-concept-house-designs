import { query, withTransaction } from '@/lib/database/client'

export async function deductPoints(userId: string, amount: number, description: string, designId?: string) {
  try {
    // Start a transaction
    return await withTransaction(async (client) => {
      // Get current points
      const profileResult = await client.query(
        'SELECT points FROM profiles WHERE id = $1',
        [userId]
      )

      if (profileResult.rows.length === 0) {
        throw new Error('User profile not found')
      }

      const currentPoints = profileResult.rows[0].points

      if (currentPoints < amount) {
        throw new Error('Insufficient points')
      }

      const newPoints = currentPoints - amount

      // Update points in profile
      await client.query(
        'UPDATE profiles SET points = $1, updated_at = NOW() WHERE id = $2',
        [newPoints, userId]
      )

      // Record transaction
      await client.query(
        `INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, -amount, 'deduction', description, designId]
      )

      return { success: true, remainingPoints: newPoints }
    })
  } catch (error) {
    console.error('Error deducting points:', error)
    throw error
  }
}

export async function addPoints(
  userId: string,
  amount: number,
  description: string,
  type: "earned" | "purchased" = "earned",
) {
  try {
    // Start a transaction
    return await withTransaction(async (client) => {
      // Get current points
      const profileResult = await client.query(
        'SELECT points FROM profiles WHERE id = $1',
        [userId]
      )

      if (profileResult.rows.length === 0) {
        throw new Error('User profile not found')
      }

      const currentPoints = profileResult.rows[0].points
      const newPoints = currentPoints + amount

      // Update points in profile
      await client.query(
        'UPDATE profiles SET points = $1, updated_at = NOW() WHERE id = $2',
        [newPoints, userId]
      )

      // Record transaction
      await client.query(
        `INSERT INTO points_transactions (user_id, amount, type, description)
         VALUES ($1, $2, $3, $4)`,
        [userId, amount, type, description]
      )

      return { success: true, newBalance: newPoints }
    })
  } catch (error) {
    console.error('Error adding points:', error)
    throw error
  }
}

// Daily points refresh function for free users
export async function claimDailyPoints(userId: string) {
  try {
    // Start a transaction
    return await withTransaction(async (client) => {
      // Check if user already claimed today
      const profileResult = await client.query(
        'SELECT points, daily_points_claimed FROM profiles WHERE id = $1',
        [userId]
      )

      if (profileResult.rows.length === 0) {
        throw new Error('User profile not found')
      }

      const profile = profileResult.rows[0]
      const today = new Date().toISOString().split('T')[0]
      
      if (profile.daily_points_claimed === today) {
        throw new Error('Daily points already claimed today')
      }

      const newPoints = profile.points + 2

      // Update points and daily claim date
      await client.query(
        `UPDATE profiles 
         SET points = $1, daily_points_claimed = $2, updated_at = NOW() 
         WHERE id = $3`,
        [newPoints, today, userId]
      )

      // Record transaction
      await client.query(
        `INSERT INTO points_transactions (user_id, amount, type, description)
         VALUES ($1, $2, $3, $4)`,
        [userId, 2, 'earned', 'Daily points refresh']
      )

      return { success: true, newBalance: newPoints }
    })
  } catch (error) {
    console.error('Error claiming daily points:', error)
    throw error
  }
}
