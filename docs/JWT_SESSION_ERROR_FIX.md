# NextAuth JWT Session Error Fix

## Problem
The JWT session error occurs because:
1. NextAuth is trying to decrypt existing JWT tokens that were created by your custom authentication system
2. The tokens are encrypted with different secrets/keys
3. Cookie conflicts between the two authentication systems

## Solution

### 1. Clear Browser Cookies
Open your browser's developer tools and run this in the console:

```javascript
// Clear all cookies related to authentication
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Specifically clear NextAuth cookies
document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

console.log("Cookies cleared!");
```

### 2. Verify Environment Variables
Make sure your `.env.local` has:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

### 4. Test Google Sign-In
1. Go to `http://localhost:3000/auth/login`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Verify you're redirected to dashboard

## Alternative: Disable NextAuth Temporarily

If you want to test without NextAuth first, you can temporarily disable it by commenting out the SessionProvider in `app/layout.tsx`:

```typescript
// <SessionProvider>
  <AuthProvider>
    <DesignProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
      </div>
    </DesignProvider>
  </AuthProvider>
// </SessionProvider>
```

## Expected Behavior After Fix

- ✅ No JWT session errors in console
- ✅ Google Sign-In works properly
- ✅ Session persists across page refreshes
- ✅ Logout works correctly
- ✅ Both Google OAuth and email/password authentication work

## Troubleshooting

If you still see errors:

1. **Check browser console** for any remaining errors
2. **Verify Google OAuth setup** in Google Cloud Console
3. **Check environment variables** are properly loaded
4. **Clear browser cache** completely
5. **Try incognito/private browsing** mode

The JWT session error should be resolved after clearing cookies and restarting the server.
