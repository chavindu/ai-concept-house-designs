import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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
