import { createClient } from "@/lib/supabase/server"

export async function deductPoints(userId: string, amount: number, description: string, designId?: string) {
  const supabase = await createClient()

  // Start a transaction
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("Failed to get user profile")
  }

  if (profile.points < amount) {
    throw new Error("Insufficient points")
  }

  // Deduct points from profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: profile.points - amount })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update points")
  }

  // Record transaction
  const { error: transactionError } = await supabase.from("points_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "deduction",
    description,
    reference_id: designId,
  })

  if (transactionError) {
    throw new Error("Failed to record transaction")
  }

  return { success: true, remainingPoints: profile.points - amount }
}

export async function addPoints(
  userId: string,
  amount: number,
  description: string,
  type: "earned" | "purchased" = "earned",
) {
  const supabase = await createClient()

  // Get current points
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("Failed to get user profile")
  }

  // Add points to profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: profile.points + amount })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update points")
  }

  // Record transaction
  const { error: transactionError } = await supabase.from("points_transactions").insert({
    user_id: userId,
    amount,
    type,
    description,
  })

  if (transactionError) {
    throw new Error("Failed to record transaction")
  }

  return { success: true, newBalance: profile.points + amount }
}

// Daily points refresh function for free users
export async function claimDailyPoints(userId: string) {
  const supabase = await createClient()
  
  // Check if user already claimed today
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("points, daily_points_claimed")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("Failed to get user profile")
  }

  const today = new Date().toISOString().split('T')[0]
  
  if (profile.daily_points_claimed === today) {
    throw new Error("Daily points already claimed today")
  }

  // Add 2 daily points
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ 
      points: profile.points + 2,
      daily_points_claimed: today
    })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update points")
  }

  // Record transaction
  const { error: transactionError } = await supabase.from("points_transactions").insert({
    user_id: userId,
    amount: 2,
    type: "earned",
    description: "Daily points refresh",
  })

  if (transactionError) {
    throw new Error("Failed to record transaction")
  }

  return { success: true, newBalance: profile.points + 2 }
}
