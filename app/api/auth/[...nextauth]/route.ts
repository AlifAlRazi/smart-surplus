import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Store from '@/models/Store';
import { cookies } from 'next/headers';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || (!user.passwordHash && user.email)) {
           // If user exists but has no passwordHash, they registered via Google.
           if (!user.passwordHash) throw new Error("Please sign in with Google.");
           return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;

        await dbConnect();
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        await dbConnect();
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (!existingUser) {
           // Read pending role from cookie
           const cookieStore = cookies();
           const pendingRole = cookieStore.get('pending_role')?.value || 'customer';
           
           // Auto-register with chosen role
           const newUser = await User.create({
             email: email.toLowerCase(),
             role: pendingRole,
             isVerified: true // Google accounts inherently verified
           });

           // If registering as a business, create the store entry too
           if (pendingRole === 'business') {
              await Store.create({
                 userId: newUser._id.toString(),
                 verificationStatus: 'pending'
              });
           }
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // 1. Log in via Credentials (user object contains everything)
      if (user && account?.provider === 'credentials') {
        token.role = (user as any).role;
        token.isVerified = (user as any).isVerified;
        token.id = user.id;
      }
      
      // 2. Log in via Google (fetch from DB to grab role)
      if (account?.provider === 'google' && user?.email) {
         await dbConnect();
         const dbUser = await User.findOne({ email: user.email.toLowerCase() });
         if (dbUser) {
            token.role = dbUser.role;
            token.isVerified = dbUser.isVerified;
            token.id = dbUser._id.toString();
         }
      }

      // Update session logic if needed
      if (trigger === "update" && session?.user) {
         token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: { signIn: '/auth/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
