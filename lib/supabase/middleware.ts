import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase client for middleware
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Get user from the request headers if available
  const authHeader = request.headers.get("authorization")
  let user = null

  if (authHeader) {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))
      user = authUser
    } catch (error) {
      // Invalid token, user remains null
    }
  }

  // Protect routes that require authentication
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/generate") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/admin"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
