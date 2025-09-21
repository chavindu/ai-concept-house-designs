import { NextResponse } from "next/server"

export async function GET() {
  console.log("🧪 TESTING AI SERVICE CONFIGURATION")
  console.log("=".repeat(50))
  
  // Check environment variables
  const apiKey = process.env.GOOGLE_AI_API_KEY
  console.log("🔑 API Key exists:", !!apiKey)
  console.log("🔑 API Key length:", apiKey?.length || 0)
  console.log("🔑 API Key preview:", apiKey ? `${apiKey.substring(0, 10)}...` : "NO KEY")
  
  // Check other important env vars
  console.log("\n📋 OTHER ENVIRONMENT VARIABLES:")
  console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL)
  console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY)
  console.log("NODE_ENV:", process.env.NODE_ENV)
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : "NO KEY",
    supabaseUrlExists: !!process.env.SUPABASE_URL,
    supabaseAnonKeyExists: !!process.env.SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
  })
}