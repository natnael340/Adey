import axios, { AxiosError } from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ALLOWED_PROVIDERS = ["credentials"];
const getCurrentEpoch = () => {
  return Math.floor(new Date().getTime() / 1000);
};

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
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
          console.log("error", data);
          return data;
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
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider)
        return ALLOWED_PROVIDERS.includes(account?.provider);
      return false;
    },
    async jwt({ user, token, account }) {
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
          console.error(x.response?.data);
        }
      }
      return token;
    },
    // @ts-ignore
    async session({ token }) {
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);
