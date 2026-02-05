import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname === "/" ||
                           nextUrl.pathname.startsWith("/dashboard") || 
                           nextUrl.pathname.startsWith("/transactions") ||
                           nextUrl.pathname.startsWith("/budgets") ||
                           nextUrl.pathname.startsWith("/goals") ||
                           nextUrl.pathname.startsWith("/projections") ||
                           nextUrl.pathname.startsWith("/advisor");
      const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [], // Confiruged in auth.ts
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
