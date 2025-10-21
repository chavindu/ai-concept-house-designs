import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // Check NextAuth JWT token
    let nextAuthToken = null
    try {
      nextAuthToken = await getToken({ 
        req: request as any, 
        secret: process.env.NEXTAUTH_SECRET 
      })
    } catch (error) {
      console.error('NextAuth token error:', error)
    }

    const diagnostics = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      },
      request: {
        url: request.url,
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        protocol: request.url.startsWith('https') ? 'https' : 'http',
      },
      cookies: {
        accessToken: request.cookies.get('access_token')?.value ? 'present' : 'missing',
        refreshToken: request.cookies.get('refresh_token')?.value ? 'present' : 'missing',
        nextAuthSession: request.cookies.get('next-auth.session-token')?.value ? 'present' : 'missing',
        allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value ? 'present' : 'missing'])),
      },
      nextAuth: {
        token: nextAuthToken ? 'present' : 'missing',
        tokenDetails: nextAuthToken ? {
          userId: (nextAuthToken as any).userId,
          email: (nextAuthToken as any).email,
          role: (nextAuthToken as any).role,
          exp: (nextAuthToken as any).exp,
          iat: (nextAuthToken as any).iat,
        } : null,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      { error: 'Diagnostic failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
