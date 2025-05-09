import React from "react";
import Header from "../components/Header";
import FeaturesList from "./FeaturesList";
import {
  BarChart2,
  Calendar,
  Cpu,
  FileText,
  Megaphone,
  MessageSquare,
  PackageOpen,
} from "lucide-react";
import Footer from "../components/Footer";

export default function Page() {
  const features = [
    {
      title: "Chat Widget",
      icon: <MessageSquare size={24} />,
      description:
        "Embeddable chat widget that integrates seamlessly into your site, enabling real-time user conversations.",
      bg: "bg-gradient-to-br from-yellow-200 to-yellow-100",
    },
    {
      title: "Analytics",
      icon: <BarChart2 size={24} />,
      description:
        "Comprehensive dashboards showing API usage and conversation metrics for data-driven insights.",
      bg: "bg-gradient-to-br from-green-200 to-green-100",
    },
    {
      title: "AI Assistant",
      icon: <Cpu size={24} />,
      description:
        "Context-aware assistant enhanced by specialized tools to handle diverse tasks.",
      bg: "bg-gradient-to-br from-purple-200 to-purple-100",
    },
    {
      title: "RAG (PDF & DOC)",
      icon: <FileText size={24} />,
      description:
        "Retrieval-Augmented Generation: upload PDFs and text docs, and the assistant uses them to answer queries.",
      bg: "bg-gradient-to-br from-blue-200 to-blue-100",
    },
    {
      title: "API Retriever",
      icon: <PackageOpen size={24} />,
      description:
        "Fetch live data from your own API endpoints, allowing the LLM to query and combine external information.",
      bg: "bg-gradient-to-br from-indigo-200 to-indigo-100",
    },
    {
      title: "Appointment Scheduler",
      icon: <Calendar size={24} />,
      description:
        "Integrates with Google OAuth to schedule meetings via natural language and LLM tool calls.",
      bg: "bg-gradient-to-br from-pink-200 to-pink-100",
    },
    {
      title: "Communication Elevation",
      icon: <Megaphone size={24} />,
      description:
        "Auto-escalates complex queries to human agents when the AI assistant requires backup.",
      bg: "bg-gradient-to-br from-red-200 to-red-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <Header activeList={{ features: true }} />

      <div className="pt-24 pb-16 px-4">
        <header className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-extrabold leading-tight">
            Explore Our Platform Features
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Unlock powerful capabilities designed to enhance your conversational
            AI experience.
          </p>
        </header>
        <FeaturesList features={features} />
      </div>
      <Footer />
    </div>
  );
}
