export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      console.log(`DEBUG - Middleware check: ${nextUrl.pathname}. isLoggedIn: ${isLoggedIn}, role: ${(auth?.user as any)?.role}`);
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnTrainer = nextUrl.pathname.startsWith("/trainer");
      const isOnCustomer = nextUrl.pathname.startsWith("/customer");

      if (isOnAdmin) {
        if (isLoggedIn) {
          const role = (auth.user as any).role;
          if (role === "ADMIN") return true;
          if (role === "TRAINER") return Response.redirect(new URL("/trainer", nextUrl));
          if (role === "CUSTOMER") return Response.redirect(new URL("/customer", nextUrl));
          return false; // Safely redirect to /login
        }
        return false; // Redirect to login
      } else if (isOnTrainer) {
        if (isLoggedIn) {
          const role = (auth.user as any).role;
          if (role === "TRAINER") return true;
          if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
          if (role === "CUSTOMER") return Response.redirect(new URL("/customer", nextUrl));
          return false; // Safely redirect to /login
        }
        return false; // Redirect to login
      } else if (isOnCustomer) {
        if (isLoggedIn) {
          const role = (auth.user as any).role;
          if (role === "CUSTOMER") return true;
          if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
          if (role === "TRAINER") return Response.redirect(new URL("/trainer", nextUrl));
          return false; // Safely redirect to /login
        }
        return false; // Redirect to login
      }
      
      // If logged in and on login or root page, redirect to their home portal
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/")) {
        const role = (auth.user as any).role;
        if (role === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        } else if (role === "TRAINER") {
          return Response.redirect(new URL("/trainer", nextUrl));
        } else {
          return Response.redirect(new URL("/customer", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
};
export default authConfig;
