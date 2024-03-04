import type { Metadata } from "next";
import { Bona_Nova } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers";
import Script from "next/script";

const inter = Bona_Nova({ subsets: ["greek"], weight: "400" });

export const metadata: Metadata = {
  title: "Adey",
  description: "Your AI Chatbot solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script src="https://www.paypal.com/sdk/js?client-id=sb&vault=true&intent=subscription"></Script>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
