import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "STUDENT" | "PREMIUM" | "ADMIN"
      subscriptionStatus: "NONE" | "ACTIVE" | "CANCELLED" | "EXPIRED"
    }
  }

  interface User {
    role: "STUDENT" | "PREMIUM" | "ADMIN"
    subscriptionStatus: "NONE" | "ACTIVE" | "CANCELLED" | "EXPIRED"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "STUDENT" | "PREMIUM" | "ADMIN"
    subscriptionStatus: "NONE" | "ACTIVE" | "CANCELLED" | "EXPIRED"
  }
}