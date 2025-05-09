import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import { api } from "./components/Api";
import { PlanType } from "./types/types";
import { AreaChart, Binary, Bot, Files, MessageCircle } from "lucide-react";

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
        <div className="w-full flex flex-col justify-center items-center space-y-5">
          <h2 className="text-3xl font-bold text-[#15192C]">
            Support That Never Sleeps
          </h2>
          <p className="text-[#797878] text-center w-1/2">
            Adey’s AI assistant delivers instant, 24/7 customer support—freeing
            your team to focus on what matters.
          </p>
        </div>
        <div className="flex flex-row items-center justify-between my-5 ">
          <div className="flex flex-col gap-y-3 w-80">
            <div className="max-w-60 px-2 py-4 bg-white rounded-t-lg rounded-bl-lg self-end">
              <p className="text-sm">Do you still have NVIDIA GTX48 GPU?</p>
            </div>
            <div className="max-w-60 px-2 py-4 bg-[#EDD447] rounded-t-lg rounded-br-lg">
              <p className="text-sm">
                Sorry, unfortunately we don’t have it at the moment. I’ll be
                happy to add you to the wait list.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 w-80">
            <div className="max-w-60 px-2 py-4 bg-[#EDD447] rounded-t-lg rounded-br-lg">
              <p className="text-sm">Hi, How can i help you today?</p>
            </div>
            <div className="max-w-60 px-2 py-4 bg-white rounded-t-lg rounded-bl-lg self-end">
              <p className="text-sm">
                Can you tell me more about Your company?
              </p>
            </div>
            <div className="max-w-60 px-2 py-4 bg-[#EDD447] rounded-t-lg rounded-br-lg">
              <p className="text-sm">
                Sure, XXX is a SASS system, that operation on ...
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 w-80">
            <div className="max-w-60 px-2 py-4 bg-white rounded-t-lg rounded-bl-lg self-end">
              <p className="text-sm">Can you set an appointment for me?</p>
            </div>
            <div className="max-w-60 px-2 py-4 bg-[#EDD447] rounded-t-lg rounded-br-lg">
              <p className="text-sm">
                Sure do, for when do you want the appointment?
              </p>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center space-y-5 my-10">
          <h2 className="text-3xl font-bold text-[#15192C]">
            Why Choose Adey?
          </h2>
        </div>
        <div className="flex flex-row justify-center items-center gap-10">
          <div className="flex flex-col items-center justify-center p-5 gap-y-3 shadow-xl rounded-lg ">
            <Binary size={74} color="#B7B7B7" />
            <p>No-Code Setup</p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 gap-y-3 shadow-xl rounded-lg ">
            <Files size={74} color="#B7B7B7" />
            <p>Multi Document</p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 gap-y-3 shadow-xl rounded-lg ">
            <Bot size={74} color="#B7B7B7" />
            <p>Personalized Agent</p>
          </div>

          <div className="flex flex-col items-center justify-center p-5 gap-y-3 shadow-xl rounded-lg ">
            <AreaChart size={74} color="#B7B7B7" />
            <p>Advanced Analytics</p>
          </div>
        </div>
      </section>
      <section className="px-20 py-5 space-y-7 bg-[#ECECEE]">
        <div className="flex w-full flex-col justify-center items-center space-y-5">
          <h2 className="text-5xl">Find Your Perfect Plan</h2>
          <p className="text-[#797878] text-center w-1/2">
            Discover the ideal plan to fuel your business growth. Our pricing
            options are carefully crafted to cater to businesses.
          </p>
        </div>
        <Pricing data={plan} />
      </section>

      <Footer />
    </main>
  );
}
