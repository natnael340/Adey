import type { Metadata } from "next";
import { Bona_Nova } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers";

const inter = Bona_Nova({ subsets: ["latin"], weight: "400" });

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
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
