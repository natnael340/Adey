"use client";

import React from "react";
import {
  Terminal,
  Wand2,
  DollarSign,
  Zap,
  Files,
  HelpCircle,
  UserCog,
  Sparkles,
} from "lucide-react";
import { BRAND_YELLOW } from "../constants/consts";
import { motion } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Features() {
  const features = [
    {
      title: "No-Code Setup",
      description: "Flip a switch, ship a bot—no SDKs, no sweat.",
      icon: <Wand2 className="h-6 w-6" />,
    },
    {
      title: "Multi-Document",
      description: "Drag in PDFs, DOCX & URLs—no wrangling, just answers.",
      icon: <Files className="h-6 w-6" />,
    },
    {
      title: "Personalized Agent",
      description: "Talks like your brand, not a bot.",
      icon: <UserCog className="h-6 w-6" />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "We are available a 100% of the time. At least our AI Agents are.",
      icon: <HelpCircle className="h-6 w-6" />,
    },
    // {
    //   title: "Money back guarantee",
    //   description:
    //     "If you do not like Every AI, we will convince you to like us.",
    //   icon: <Zap className="h-6 w-6" />,
    // },
    // {
    //   title: "And everything else",
    //   description: "I just ran out of copy ideas. Accept my sincere apologies",
    //   icon: <Heart className="h-6 w-6" />,
    // },
  ];

  return (
    <>
      <div className="mt-20 text-center">
        <motion.h2
          className="text-3xl font-bold text-slate-900"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
        >
          Why Choose Adey?
        </motion.h2>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto"
        style={{ ["--brand-yellow" as any]: BRAND_YELLOW }}
      >
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </>
  );
}

function Feature({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature",
        "lg:border-r border-neutral-300",
        (index === 0 || index === 4) && "lg:border-l border-neutral-300",
        index < 4 && "lg:border-b border-neutral-300"
      )}
    >
      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-slate-700 dark:text-slate-300">
        {icon}
      </div>

      {/* Title with brand accent bar */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-[var(--brand-yellow)] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900 dark:text-slate-100">
          {title}
        </span>
      </div>

      {/* Description with high contrast */}
      <p className="text-sm text-slate-800 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
}
