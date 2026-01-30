import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, createUser, updateUser } from "@/lib/database/server"
import { verifyPassword } from "@/lib/auth/password"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await getUserByEmail(credentials.email)
        
        if (!user || !user.password_hash) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await verifyPassword(credentials.password, user.password_hash)
        
        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
          role: user.role,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          let existingUser = await getUserByEmail(user.email!)
          
          if (!existingUser) {
            // Create new user
            const created = await createUser({
              email: user.email!,
              full_name: user.name || user.email!,
              email_verified: true,
            })
            
            // Update avatar FIRST before anything else
            if (user.image) {
              await updateUser(created.id, { avatar_url: user.image, role: 'user' as any })
            }
            
            // Ensure profile is created with 10 free points
            const { ensureUserProfile, createOAuthAccount } = await import("@/lib/database/server")
            await ensureUserProfile(created.id)
            
            // Create OAuth account link
            await createOAuthAccount({
              user_id: created.id,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            })
          } else {
            // Ensure existing user has a profile
            const { ensureUserProfile, createOAuthAccount } = await import("@/lib/database/server")
            await ensureUserProfile(existingUser.id)
            
            // Update or create OAuth account link
            await createOAuthAccount({
              user_id: existingUser.id,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            })
            
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
      // On initial sign-in, user object contains Google profile data
      if (user) {
        token.userId = user.id
        token.role = (user as any).role || 'user'
        token.image = user.image || null
      }
      
      // Always attempt to hydrate from DB to get latest data
      try {
        const email = (token?.email as string)
        if (email) {
          const dbUser = await getUserByEmail(email)
          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            // Prefer DB avatar, fallback to token image
            token.image = dbUser.avatar_url || (token as any)?.image || null
          }
        }
      } catch (e) {
        console.error('JWT callback error:', e)
      }
      
      console.log('JWT callback - token:', {
        userId: (token as any).userId,
        email: (token as any).email,
        role: (token as any).role,
        hasImage: !!(token as any).image,
        imageUrl: (token as any).image
      })
      
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - token:', {
        userId: (token as any).userId,
        email: (token as any).email,
        role: (token as any).role,
      })
      
      if (session.user && token.userId) {
        (session.user as any).id = token.userId as string;
        (session.user as any).role = (token as any).role as string
      }
      // Always set session.user.image if available
      const img = (token as any).image
      if (session.user && img) {
        session.user.image = img as string
      }
      
      console.log('Session callback - session:', {
        userId: session.user ? (session.user as any).id : null,
        email: session.user?.email,
        role: session.user ? (session.user as any).role : null,
        hasImage: !!(session.user?.image),
        imageUrl: session.user?.image
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
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