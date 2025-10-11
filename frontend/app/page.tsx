import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer2";
import Pricing from "./components/Pricing";
import { api } from "./components/Api";
import { PlanType } from "./types/types";
import { AreaChart, Binary, Bot, Files, MessageCircle } from "lucide-react";
import ChatDemo from "./components/ChatDemo";
import Features from "./components/Features";

export default async function Home() {
  const { data: plan } = await api.get<PlanType[]>("plans/");
  return (
    <main className="min-h-screen">
      <Header activeList={{ home: true }} absolute />
      <section className="home h-screen w-full flex flex-col relative py-5 px-32 bg-gradient-to-b from-[#FFD53D] to-[#ECECEE]">
        <div className="container flex-1 flex justify-center items-center ">
          <div className="text-center space-y-3">
            <h1 className="text-6xl font-bold">
              Transform Your Company with AI-Powered Chatbot
            </h1>
            <p className="text-[#363636]">
              Instant, seamless customer support with AI-powered chatbots
            </p>
            <div className="pt-5 flex flex-row gap-x-5 items-center justify-center">
              <a
                role="button"
                className="bg-[#FBBF24] text-[#15192C] text-xl font-semibold px-10 py-3 rounded-lg"
                href="/auth/login"
              >
                Try Now
              </a>
              <a
                role="button"
                className="border-[#15192C] border-[2px] text-[#15192C] text-xl font-semibold px-7 py-[0.65rem] rounded-lg"
                href="/auth/login"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="px-20 py-5 gap-y-20 bg-[#ECECEE]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Copy + CTAs */}
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Support That Never Sleeps
              </h1>
              <p className="mt-4 max-w-prose text-base text-slate-600">
                Adey’s AI assistant delivers instant, 24/7 customer
                support—freeing your team to focus on what matters.
              </p>
            </div>
            {/* Chat Demo */}
            <ChatDemo />
          </div>
        </div>
        <div className="mt-2">
          <Features />
        </div>
      </section>
      <Footer />
    </main>
  );
}
