/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import DiscordProvider from "next-auth/providers/discord";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type {DefaultSession, NextAuthOptions} from "next-auth";
import { getServerSession } from "next-auth";

import { db, tableCreator } from "@acme/db";

import { env } from "./env.mjs";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"

// Update this whenever adding new providers so that the client can
export const providers = ["discord"] as const;
export type OAuthProviders = (typeof providers)[number];

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: DrizzleAdapter(db, tableCreator),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
} satisfies NextAuthOptions;
// type asdfalkdf = typeof getServerSession;
// export const getServerAuthSession = () => getServerSession(authOptions);

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
// export const config = {
//   providers: [], // rest of your config
// } satisfies NextAuthOptions

// Use it in server contexts
export function getServerAuthSession(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, authOptions)
}