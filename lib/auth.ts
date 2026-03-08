import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "./prisma";
import { compare, hash } from "bcryptjs";

declare module "next-auth" {
  interface User {
    role: string;
    teamId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      teamId?: string | null;
    };
  }
}

const credentialsSchema = z.object({
  email: z.string().email("Invalid email format").refine(
    (email) => { const domain = email.split("@")[1]; return domain && domain.toLowerCase() === "iiits.in"; },
    { message: "Email must exactly end with @iiits.in" }
  ),
  password: z.string().min(6).max(20),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/auth/login" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", placeholder: "student@iiits.in" },
        password: { type: "password", label: "Password", placeholder: "*****" },
      },
      authorize: async (credentials) => {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { email, password } = parsed.data;
          const lowerEmail = email.toLowerCase();
          let user = await prisma.user.findUnique({ where: { email: lowerEmail } });
          if (user) {
            if (!user.password) return null;
            const isValid = await compare(password, user.password);
            if (!isValid) return null;
          } else {
            const namePrefix = email.split("@")[0].replace(/\./g, " ");
            let college = await prisma.college.findUnique({ where: { tag: "IIIT SRICITY" } });
            if (!college) {
              college = await prisma.college.create({ data: { tag: "IIIT SRICITY", name: "Indian Institute of Information Technology Sri City" } });
            }
            const hashedPassword = await hash(password, 10);
            user = await prisma.user.create({ data: { email: lowerEmail, name: namePrefix, password: hashedPassword, collegeId: college.id } });
          }
          return { id: user.id, email: user.email, role: user.role, name: user.name };
        } catch (error) { console.error("Error in authorize:", error); return null; }
      },
    }),
  ],
  session: { strategy: "jwt", updateAge: 0, maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
      }
      // Always refresh role + teamId from DB on every request
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, teamId: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.teamId = dbUser.teamId;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;
      session.user.teamId = token.teamId as string | null;
      return session;
    },
  },
});
