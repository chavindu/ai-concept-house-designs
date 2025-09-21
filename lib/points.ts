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
    type: "spent",
    description,
    design_id: designId,
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
