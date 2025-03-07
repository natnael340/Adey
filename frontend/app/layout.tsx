import type { Metadata } from "next";
import { Bona_Nova } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers";
import Script from "next/script";
import { cn } from "@/lib/utils";

const fontSans = Bona_Nova({
  subsets: ["greek"],
  weight: "400",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Adey",
  description: "Your AI Chatbot solution",
};

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_PROTOCOL}://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="adey_chat_id"
          content="d0263fca-2060-4813-b346-03fe2d9b4b06"
        />

        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href={`${BASE_URL}/media/chatbot/index.css`}
        />
      </head>

      <Script src="https://www.paypal.com/sdk/js?client-id=sb&vault=true&intent=subscription"></Script>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>{children}</AuthProvider>
        <script
          type="module"
          crossOrigin="anonymous"
          src={`${BASE_URL}/media/chatbot/index.js`}
        ></script>
      </body>
    </html>
  );
}
