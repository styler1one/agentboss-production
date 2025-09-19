import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      profileComplete: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    profileComplete: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    profileComplete: boolean
  }
}
