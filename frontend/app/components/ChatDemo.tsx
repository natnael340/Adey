"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Bubble from "./Bubble";
import TypingDots from "./TypingDots";
import { CHAT_SAMPLE } from "../constants/consts";

function ChatDemo() {
  const [index, setIndex] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let t: any;
    if (index < CHAT_SAMPLE.length) {
      const next = CHAT_SAMPLE[index];
      if (next.side === "bot") {
        setIsTyping(true);
        t = setTimeout(() => {
          setIsTyping(false);
          setIndex((i) => i + 1);
        }, 1600);
      } else {
        t = setTimeout(() => setIndex((i) => i + 1), 1400);
      }
    }
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [index, isTyping]);

  const visibleMessages = CHAT_SAMPLE.slice(0, index);
  const containerVariants = {
    hidden: { y: 32, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  } as const;
  const listVariants = {
    visible: { transition: { staggerChildren: 0.18 } },
  } as const;
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  } as const;
  return (
    <motion.div
      className="mx-auto w-full max-w-sm"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 shadow-sm backdrop-blur">
        {/* Fixed-height chat window */}
        <div className="h-[22rem] flex flex-col">
          <motion.div
            ref={scrollRef}
            className="mt-auto space-y-4 pr-1"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleMessages.map((m, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Bubble messageType={m.side as "user" | "bot"}>{m.text}</Bubble>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div key="typing" variants={itemVariants}>
                <Bubble messageType="bot">
                  <TypingDots />
                </Bubble>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatDemo;
