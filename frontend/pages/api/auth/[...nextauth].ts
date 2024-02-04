import { JwtUtils } from "@/app/constants/Utils";
import {
  AuthenticatedUser,
  AuthenticatedUserSession,
  AuthenticatedUserToken,
  AuthenticationResponseType,
} from "@/app/types/types";
import axios, { AxiosError } from "axios";
import NextAuth, {
  Account,
  Awaitable,
  NextAuthOptions,
  Profile,
  Session,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider, {
  CredentialInput,
} from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const ALLOWED_PROVIDERS = ["credentials", "google"];
type SignInParamType = {
  user: AuthenticatedUser;
  account: Account | null;
  profile?: Profile;
  email?: {
    verificationRequest?: boolean;
  };
  credentials?: Record<string, CredentialInput>;
};
type JWTParamType = {
  token: AuthenticatedUserToken;
  user: AuthenticatedUser;
  account: Account | null;
  profile?: Profile | undefined;
  trigger?: "signIn" | "signUp" | "update" | undefined;
  isNewUser?: boolean | undefined;
  session?: any;
};
type SessionParamType = {
  session: AuthenticatedUserSession;
  token: AuthenticatedUserToken;
  user: AuthenticatedUser;
} & {
  newSession: any;
  trigger: "update";
};

namespace NextAuthUtils {
  export const refreshToken = async (refreshToken: string) => {
    try {
      const { data } = await axios.post<{ access: string }>(
        `${process.env.NEXTAUTH_BACKEND_URL}token/refresh/`,
        {
          refresh: refreshToken,
        }
      );
      const { access } = data;
      return access;
    } catch (error) {
      return null;
    }
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "malik@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "************",
        },
      },
      async authorize(credentials, req) {
        try {
          const { data } = await axios({
            url: `${process.env.NEXTAUTH_BACKEND_URL}auth/login`,
            method: "POST",
            data: credentials,
          });
          const user: AuthenticatedUser = {
            id: "user_id",
            accessToken: data.token,
            refreshToken: data.refresh,
          };
          return user;
        } catch (error: any) {
          const x: AxiosError = error;

          if (x.response?.data) {
            console.error(x.response?.data, x.message);
            throw new Error("Invalid email or password.");
          }
        }
        return null;
      },
    }),
    Google({
      // @ts-ignore
      clientId: process.env.GOOGLE_CLIENT_ID,
      // @ts-ignore
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 60000,
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
      email,
      credentials,
    }: SignInParamType) {
      if (account?.provider)
        return ALLOWED_PROVIDERS.includes(account?.provider);
      return false;

      /*
      if (account?.provider == "google") {
        const { access_token, id_token } = account;

        try {
          const { data } = await axios.post<AuthenticationResponseType>(
            `${process.env.NEXTAUTH_BACKEND_URL}auth/social/google`,
            {
              access_token: access_token,
              id_token: id_token,
            }
          );
          const { access: accessToken } = data;
          user.accessToken = accessToken;
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
      return true;
      */
    },
    // @ts-ignore
    async jwt({ user, token, account }: JWTParamType) {
      if (user) {
        if (account?.provider == "google") {
          const { access_token, id_token } = account;

          try {
            const { data } = await axios.post<AuthenticationResponseType>(
              `${process.env.NEXTAUTH_BACKEND_URL}auth/social/google`,
              {
                access_token: access_token,
                id_token: id_token,
              }
            );
            const { access: accessToken, refresh: refreshToken } = data;
            token.accessToken = accessToken;
            token.refreshToken = refreshToken;
            return token;
          } catch (error) {
            return null;
          }
        } else if (account?.provider == "credentials") {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;

          return token;
        }
      }
      if (
        token.refreshToken &&
        JwtUtils.isJwtExpired(token.accessToken as string)
      ) {
        const _access_token = await NextAuthUtils.refreshToken(
          token.refreshToken
        );
        if (_access_token) {
          token.accessToken = _access_token;
          token.iat = Math.floor(Date.now() / 1000);
          token.exp = Math.floor(Date.now() / 1000 + 2 * 60 * 60);

          return token;
        } else {
          token.exp = 0;
        }
      }
      return token;

      /*
      // @ts-ignore
      if (user && user.error == 0 && account) {
        // @ts-ignore
        token.accessToken = user.token;
        // @ts-ignore
        token.refresh_token = user.refresh;
        token["ref"] =
          getCurrentEpoch() +
          parseInt(process.env.BACKEND_ACCESS_TOKEN_LIFETIME || "0");
        return token;
        
      }

      // @ts-ignore
      if (getCurrentEpoch() > token.ref) {
        try {
          const { data } = await axios({
            method: "POST",
            url: `${process.env.NEXTAUTH_BACKEND_URL}token/refresh/`,
            data: {
              refresh: token.refresh_token,
            },
          });
          token.accessToken = data.access;
          token.ref =
            getCurrentEpoch() +
            parseInt(process.env.BACKEND_ACCESS_TOKEN_LIFETIME || "0");
        } catch (error: any) {
          const x: AxiosError = error;
          console.error("here", x.response?.data);
          token.expired = true;
        }
      }
      return token;
      */
    },
    // @ts-ignore
    async session({ token, session, user }: SessionParamType) {
      if (token?.accessToken && token.exp != 0) {
        session.accessToken = token?.accessToken;
        return session;
      }
      return null;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
};

export default NextAuth(authOptions);
