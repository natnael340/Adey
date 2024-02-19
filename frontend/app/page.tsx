import { Navbar, Button, Card } from "flowbite-react";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import { FaBullseye, FaCheck } from "react-icons/fa";
import { NextRequest } from "next/server";
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
              Transform Your Company with AI-Powered Tools
            </h1>
            <p className="text-[#363636]">
              Enhance customer support with AI chat bots and boost sales with
              intelligent sales agents. Revolutionize your operations and
              deliver exceptional customer experiences with our advanced AI
              solutions.
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
          <p className="text-justify text-[#797878]">
            Welcome to our website! We are proud to present our groundbreaking
            AI-powered customer service and sales agent solution. Our innovative
            technology has redefined the way businesses engage with their
            customers and drive sales. With our AI-powered platform, you can
            harness the potential of artificial intelligence to deliver
            exceptional customer service and maximize your sales potential. Our
            intelligent system seamlessly integrates customer support and sales
            functionalities, providing a comprehensive solution for your
            business needs. Say goodbye to traditional customer service and
            sales approaches—our AI-powered agent is capable of understanding
            and responding to customer inquiries, providing personalized
            recommendations, and closing deals with precision. Join us on the
            forefront of AI innovation and witness how our solution can
            transform your customer service and sales operations.
          </p>
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
