import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              clientProfile: true,
              expertProfile: true
            }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            profileComplete: user.profileComplete,
            name: user.expertProfile 
              ? `${user.expertProfile.firstName} ${user.expertProfile.lastName}`
              : user.clientProfile?.companyName || user.email
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.profileComplete = (user as any).profileComplete
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.profileComplete = token.profileComplete
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user from Google OAuth
            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                role: 'CLIENT', // Default role
                emailVerified: true,
                profileComplete: false
              }
            })
          }

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }

      return true
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
