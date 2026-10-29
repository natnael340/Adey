"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { Mood } from "./AdeyScene";

// three.js only loads in the browser, after the page is interactive
const AdeyScene = dynamic(() => import("./AdeyScene"), { ssr: false });

function canRender3D() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function AdeyCharacter({ mood, className }: { mood: Mood; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSupported(canRender3D());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimate(!reduced.matches);
    sync();
    reduced.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    if (box.current) observer.observe(box.current);
    return () => {
      reduced.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={box} aria-hidden className={cn("relative aspect-square", className)}>
      {/* The flat mark holds the space until the scene runs, then fades as Adey pops in */}
      <img
        src="/brand/adey-mark.svg"
        alt=""
        className={cn(
          "absolute inset-[5.57%] h-[88.86%] w-[88.86%] motion-safe:transition-opacity motion-safe:duration-300",
          ready && "opacity-0"
        )}
      />
      {supported && (
        <AdeyScene mood={mood} animate={animate} active={active} onReady={() => setReady(true)} />
      )}
    </div>
  );
}
