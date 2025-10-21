import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getUserByEmail, createUser, updateUser } from "@/lib/database/server"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          let existingUser = await getUserByEmail(user.email!)
          
          if (!existingUser) {
            const created = await createUser({
              email: user.email!,
              full_name: user.name || user.email!,
              email_verified: true,
            })
            if (user.image) {
              await updateUser(created.id, { avatar_url: user.image, role: 'user' as any })
            }
          } else {
            if (user.image && existingUser.avatar_url !== user.image) {
              await updateUser(existingUser.id, { avatar_url: user.image })
            }
          }
          
          return true
        } catch (error) {
          console.error('Error during Google sign-in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Always attempt to hydrate image from DB on each JWT call
      try {
        const email = (user?.email as string) || (token?.email as string)
        if (email) {
          const dbUser = await getUserByEmail(email)
          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            // Prefer DB avatar, fallback to provider/default token image
            token.image = dbUser.avatar_url || (user as any)?.image || (token as any)?.image || null
          } else if (user) {
            // New user path before DB read reflects
            token.image = (user as any)?.image || (token as any)?.image || null
          }
        }
      } catch (e) {
        console.error('JWT callback error:', e)
        // Fallback to existing token values on any error
        token.image = (token as any)?.image || null
      }
      
      console.log('JWT callback - token:', {
        userId: (token as any).userId,
        email: (token as any).email,
        role: (token as any).role,
        hasImage: !!(token as any).image
      })
      
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - token:', {
        userId: (token as any).userId,
        email: (token as any).email,
        role: (token as any).role,
      })
      
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.role = (token as any).role as string
      }
      // Always set session.user.image if available
      const img = (token as any).image
      if (img) {
        session.user.image = img as string
      }
      
      console.log('Session callback - session:', {
        userId: (session.user as any).id,
        email: session.user.email,
        role: (session.user as any).role,
      })
      
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  jwt: {
    maxAge: 15 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
        domain: process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN ? 
          process.env.COOKIE_DOMAIN.replace(/^https?:\/\//, '').split('/')[0] : undefined,
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}