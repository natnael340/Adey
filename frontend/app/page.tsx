import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import { api } from "./components/Api";
import { PlanType } from "./types/types";

export default async function Home() {
  const { data: plan } = await api.get<PlanType[]>("plans/");
  return (
    <main className="min-h-screen bg-gradient-to-br from-25% from-white via-[#FFFFB3] to-white">
      <section className="home h-screen w-full bg-[rgba(255,255,0,0.15)] flex flex-col relative py-5 px-32">
        <Header activeList={{ home: true }} />
        <div className="container flex-1 grid grid-cols-2 items-center">
          <div className="space-y-16">
            <h1 className="text-6xl font-bold">
              Transform Your Company with AI-Powered Chatbot
            </h1>
            <p className="text-[#363636]">
              Enhance your customer support with AI-powered chatbots, providing
              instant responses and seamless assistance. Improve efficiency,
              reduce wait times, and deliver exceptional customer experiences
              with our advanced AI solutions.
            </p>
            <div className="pt-5">
              <a
                role="button"
                className="bg-[#EDD447] text-[#15192C] text-xl font-semibold px-10 py-3 rounded-lg"
                href="/auth/login"
              >
                Get Started
              </a>
            </div>
          </div>
          <Image src="/bot_logo.png" width={500} height={500} alt="Ai Bot" />
        </div>
      </section>
      <section className="grid grid-cols-2 items-center px-20 py-20 gap-x-20">
        <Image
          src="/robot_with_kid.png"
          width={840}
          height={931}
          alt="Ai Sales"
        />

        <div>
          <h3 className="py-4 text-3xl font-bold text-[#363636]">
            We didn't reinvent the wheel.
          </h3>
          <p className="text-justify">
            Welcome to a new era of customer service! Our cutting-edge
            AI-powered customer support bot transforms the way businesses engage
            with their customers—providing instant, intelligent, and seamless
            assistance around the clock.
          </p>
          <div className="mt-8 grid grid-rows-3 gap-1 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-sm">✔️</span>
              <p>
                <strong>Instant Responses</strong> – No more wait times! Get
                real-time customer support.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-sm">✔️</span>
              <p>
                <strong>Personalized Assistance</strong> – AI-powered
                recommendations for every customer.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-sm">✔️</span>
              <p>
                <strong>24/7 Availability</strong> – Always online, ensuring
                customer satisfaction.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-sm">✔️</span>
              <p>
                <strong>Seamless Integration</strong> – Works with your CRM,
                helpdesk, and chat platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-20 py-5 space-y-7">
        <div className="flex w-full flex-col justify-center items-center space-y-5">
          <h2 className="text-5xl">Find Your Perfect Plan</h2>
          <p className="text-[#797878] text-center w-1/2">
            Discover the ideal plan to fuel your business growth. Our pricing
            options are carefully crafted to cater to businesses.
          </p>
        </div>
        <Pricing data={plan} />
      </section>
      <section className="mt-10">
        <Footer />
      </section>
    </main>
  );
}
