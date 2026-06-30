import type { NextAuthConfig } from "next-auth"
import type { UserRole } from "@/generated/prisma/enums"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; role: UserRole; organizationId: string; organizationName: string }
        token.id = u.id ?? ""
        token.role = u.role
        token.organizationId = u.organizationId
        token.organizationName = u.organizationName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
      }
      return session
    },
  },
}
