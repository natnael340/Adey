import { Navbar, Button, Card } from "flowbite-react";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

export default function Home() {
  return (
    <main className="h-screen">
      <section className="h-screen w-full bg-[rgba(255,255,0,0.15)] flex flex-col relative">
        <Header activeList={{ home: true }} />
        <div className="container flex-1 flex flex-row justify-evenly items-center w-full">
          <div className=" pl-[10%] flex-1 z-10">
            <h1 className="py-4 text-6xl font-bold">
              Transform Your Company with AI-Powered Tools
            </h1>
            <p className="py-2">
              Enhance customer support with AI chat bots and boost sales with
              intelligent sales agents. Revolutionize your operations and
              deliver exceptional customer experiences with our advanced AI
              solutions.
            </p>
            <Button
              className="bg-[#EDD447] text-black my-2 w-36"
              as={Link}
              href="/auth/login"
            >
              Get Started
              <span className="ml-1">
                <IoArrowForward />
              </span>
            </Button>
          </div>
          <div className="flex-1 flex justify-end items-end">
            <div className="absolute bottom-0 right-0 z-0">
              <Image src="/ai_cs.png" alt="Logo" width={700} height={700} />
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-row justify-between items-center px-32 py-20 gap-x-10">
        <div className="flex-1">
          <h3 className="py-4 text-lg font-bold">
            We Invented Ai Powered Customer service & Sales Agent.
          </h3>
          <p>
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
        <div className="flex flex-row gap-x-4 flex-1 justify-center items-center">
          <div>
            <Image
              src="/ai_sales.jpg"
              width={250}
              height={580}
              alt="Ai Sales"
              className="rounded-lg bg-red-700"
            />
          </div>
          <div className="pt-28">
            <Image
              src="/ai_customer_support.jpg"
              width={250}
              height={580}
              alt="Ai Sales"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>
      <section>
        <div className="flex w-full flex-col">
          <div className="flex flex-col justify-center items-center gap-y-1 my-5">
            <h3>Products</h3>
            <div className="w-5 h-1 bg-slate-400"></div>
          </div>
          <div className="flex flex-row items-center justify-center gap-x-6">
            <Card
              className="max-w-sm"
              renderImage={() => (
                <Image
                  width={500}
                  height={500}
                  src="/sales_cartoon.png"
                  alt="Sales Cartoon"
                />
              )}
            >
              <h4 className="text-center font-semibold">Customer Support</h4>
            </Card>
            <Card
              className="max-w-sm"
              renderImage={() => (
                <Image
                  width={500}
                  height={500}
                  src="/sales_cartoon.png"
                  alt="Sales Cartoon"
                />
              )}
            >
              <h4 className="text-center font-semibold">Sales Agent</h4>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <Footer />
      </section>
    </main>
  );
}
