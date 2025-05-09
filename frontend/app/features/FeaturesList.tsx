"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { motion } from "framer-motion";

interface FeaturesType {
  title: string;
  icon: JSX.Element;
  description: string;
  bg: string;
}
function FeaturesList({ features }: { features: FeaturesType[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {features.map((feat, idx) => (
        <motion.div
          key={feat.title}
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
        >
          <Card className="overflow-hidden rounded-2xl shadow-lg h-full flex flex-col">
            <div className={`${feat.bg} p-6 flex items-center justify-center`}>
              <div className="rounded-full bg-white p-3 shadow-md">
                {React.cloneElement(feat.icon, {
                  className: "text-yellow-500",
                })}
              </div>
            </div>
            <CardContent className="p-6">
              <CardTitle className="text-xl font-semibold mb-2">
                {feat.title}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {feat.description}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}

export default FeaturesList;
