import NextAuth from "next-auth"
import { UserRole, Level } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    level?: Level | null
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
      level?: Level | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    level?: Level | null
  }
}