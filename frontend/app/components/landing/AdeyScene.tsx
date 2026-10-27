"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useGeometry, useKit, type Kit } from "./adey/kit";
import Head from "./adey/Head";
import Eyes from "./adey/Eyes";
import Brows from "./adey/Brows";
import Mouth from "./adey/Mouth";
import Petals from "./adey/Petals";
import Body from "./adey/Body";
import Arms, { ARM_REST } from "./adey/Arms";
import Leaf from "./adey/Leaf";

export type Mood = "idle" | "thinking" | "answering";

type ParamType = {
  mood: Mood;
  // false under prefers-reduced-motion: Adey holds its final pose
  animate: boolean;
  // false while the hero is off screen
  active: boolean;
  onReady: () => void;
};

const HEAD_Y = 0.3;
const ROOT_Y = -0.05;
// Just under the feet
const GROUND_Y = -0.985;
const INTRO_SECONDS = 0.9;
// Stop following a pointer that has been still this long and look around instead
const POINTER_SECONDS = 2.5;

const POKES = ["squish", "spin", "jump", "giggle"] as const;
const FIDGETS = ["tilt", "wave", "bounce", "petals"] as const;
type Poke = (typeof POKES)[number];
type Fidget = (typeof FIDGETS)[number];

const { damp, clamp, lerp } = THREE.MathUtils;
// Page time, not R3F's clock: changing frameloop (scrolling the hero away and back) resets clock.elapsedTime to 0
const now = () => performance.now() / 1000;
const easeOutBack = (x: number) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
// 0 → 1 → 0 over `length` seconds after an event
const pulse = (since: number, length: number) => (since >= 0 && since < length ? Math.sin((since / length) * Math.PI) : 0);
const pick = <T,>(items: readonly T[], not?: T) => {
  const choices = items.filter((item) => item !== not);
  return choices[Math.floor(Math.random() * choices.length)];
};

// Pointer position relative to the canvas centre, -1..1 across the window, and when it last moved
function usePointer(enabled: boolean) {
  const canvas = useThree((s) => s.gl.domElement);
  const pointer = useRef({ x: 0, y: 0, at: -10 });
  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.x = clamp((e.clientX - r.left - r.width / 2) / (window.innerWidth / 2), -1, 1);
      pointer.current.y = clamp((e.clientY - r.top - r.height / 2) / (window.innerHeight / 2), -1, 1);
      pointer.current.at = now();
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [canvas, enabled]);
  return pointer;
}

function Studio() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  // Layout effect so the first frame is already lit
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    // Dimmer, and turned so the room's ceiling light lands above-left of the face, not between the eyes
    scene.environmentIntensity = 0.75;
    scene.environmentRotation.set(-0.5, 0.6, 0);
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      <directionalLight
        position={[-1, 5, 1.8]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={1.4}
        shadow-camera-bottom={-1.4}
        shadow-camera-near={1}
        shadow-camera-far={8}
      />
      {/* Warm bounce from the floor, so the undersides stay yellow instead of going olive */}
      <directionalLight position={[0, -2, 3]} intensity={0.35} color="#FFE2A8" />
    </>
  );
}

// A soft contact shadow under the feet
const Ground = React.forwardRef<THREE.Mesh, { kit: Kit }>(function Ground({ kit }, ref) {
  const blob = useGeometry(() => {
    const geometry = new THREE.RingGeometry(0, 1, 64, 12);
    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 4).fill(1);
    for (let i = 0; i < positions.count; i += 1) {
      const r = Math.hypot(positions.getX(i), positions.getY(i));
      colors[i * 4 + 3] = (1 - r * r) ** 2;
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  });
  return <mesh ref={ref} geometry={blob} material={kit.shadow} position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} />;
});

function Adey({ mood, animate, onReady }: Omit<ParamType, "active">) {
  const kit = useKit();
  const pointer = usePointer(animate);
  const invalidate = useThree((s) => s.invalidate);

  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const gaze = useRef<THREE.Group[]>([]);
  const brows = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Group>(null!);
  const waveArm = useRef<THREE.Group>(null!);
  const petalSways = useRef<THREE.Group[]>([]);
  const shadow = useRef<THREE.Mesh>(null!);
  const timing = useRef({
    start: -1,
    nextBlink: 2.2,
    blinkAt: -10,
    hopAt: -10,
    hopHeight: 0.08,
    poke: "squish" as Poke,
    pokeAt: -10,
    fidget: "tilt" as Fidget,
    fidgetAt: -10,
    nextFidget: 6,
    glance: { x: 0, y: 0, until: 0, mouth: 0.15 },
    hover: false,
    look: { x: 0, y: 0 },
    eye: { x: 0, y: 0 },
    yaw: 0,
    bloom: 0,
    open: 0.15,
    happy: 0,
    think: 0,
    wave: 0,
    ready: false,
  });

  useEffect(() => {
    if (mood === "answering") Object.assign(timing.current, { hopAt: now(), hopHeight: 0.08 });
    invalidate();
  }, [mood, invalidate]);

  // Every part casts and catches shadows, except the face details, which would draw doubled outlines
  useLayoutEffect(() => {
    root.current.traverse((object) => {
      object.castShadow = object.receiveShadow = object instanceof THREE.Mesh;
    });
    [eyes, brows, mouth].forEach((part) => part.current.traverse((object) => (object.castShadow = false)));
  }, []);

  useFrame((_, dt) => {
    const t = now();
    const k = timing.current;
    if (k.start < 0) k.start = t;
    // With reduced motion every value jumps straight to its target
    const ease = (from: number, to: number, lambda: number) => (animate ? damp(from, to, lambda, dt) : to);

    // Intro: Adey pops up from nothing
    const intro = animate ? clamp((t - k.start) / INTRO_SECONDS, 0, 1) : 1;
    const sincePoke = t - k.pokeAt;
    const sinceFidget = t - k.fidgetAt;
    const poked = (kind: Poke, length: number) => (k.poke === kind && sincePoke < length ? sincePoke : -1);
    const fidgeting = (kind: Fidget, length: number) => (k.fidget === kind && sinceFidget < length ? sinceFidget : -1);

    // Now and then, while nothing else is going on, do something small
    if (animate && mood === "idle" && !k.hover && t - k.start > k.nextFidget) {
      k.fidget = pick(FIDGETS, k.fidget);
      k.fidgetAt = t;
      k.nextFidget = t - k.start + 5 + Math.random() * 5;
      if (k.fidget === "bounce") Object.assign(k, { hopAt: t, hopHeight: 0.05 });
    }

    // Body: pop-in, breathing, squash after a squish or a landing
    const size = Math.max(easeOutBack(intro), 0.001); // never 0, or pointer hits can't invert the matrices
    const breath = animate ? 1 + 0.015 * Math.sin(t * 1.6) : 1;
    const squish = poked("squish", 1.2);
    const landing = t - k.hopAt - 0.45;
    const squash =
      (squish >= 0 ? 0.1 * Math.exp(-squish * 5) * Math.sin(squish * 18) : 0) +
      (landing >= 0 && landing < 0.5 ? -0.06 * (k.hopHeight / 0.08) * Math.exp(-landing * 8) * Math.cos(landing * 20) : 0);
    body.current.scale.set(size * breath * (1 + squash / 2), size * breath * (1 - squash), size * (1 + squash / 2));
    body.current.rotation.z = animate ? 0.02 * Math.sin(t * 1.1) : 0;

    // Where to look: the pointer while it moves, otherwise glance around and back at the visitor
    const following = animate && t - pointer.current.at < POINTER_SECONDS;
    if (animate && !following && t > k.glance.until) {
      const atVisitor = Math.random() < 0.4;
      k.glance.x = atVisitor ? 0 : (Math.random() - 0.5) * 1.6;
      k.glance.y = atVisitor ? 0 : (Math.random() - 0.6) * 0.9;
      k.glance.until = t + 1.2 + Math.random() * 2.3;
      // A fresh expression with each glance: a big smile for the visitor, otherwise somewhere from shut to half open
      k.glance.mouth = atVisitor ? 0.75 : Math.random() * 0.45;
    }
    let lookX = following ? pointer.current.x : k.glance.x;
    let lookY = following ? pointer.current.y : k.glance.y;
    k.think = ease(k.think, mood === "thinking" ? 1 : 0, 6);
    // Thinking: eyes roll up and to the side
    lookX = lerp(lookX, 0.55, k.think);
    lookY = lerp(lookY, -0.85, k.think);
    // Eyes dart, the head follows, the body barely turns
    k.eye.x = ease(k.eye.x, lookX, 18);
    k.eye.y = ease(k.eye.y, lookY, 18);
    k.look.x = ease(k.look.x, lookX, 4);
    k.look.y = ease(k.look.y, lookY, 4);
    k.yaw = ease(k.yaw, lookX * 0.14 * intro, 2);
    gaze.current.forEach((eye) => eye.rotation.set(k.eye.y * 0.32, k.eye.x * 0.42, 0));

    const giggle = poked("giggle", 0.9);
    const tilt = pulse(fidgeting("tilt", 1.8), 1.8) * 0.2;
    head.current.rotation.set(
      k.look.y * 0.18 * intro - 0.12 * k.think,
      k.look.x * 0.4 * intro,
      -k.look.x * 0.05 + 0.14 * k.think + tilt + (giggle >= 0 ? 0.1 * Math.sin(giggle * 28) * (1 - giggle / 0.9) : 0),
    );

    // Happy while hovered or giggling: eyes squint, brows lift, smile widens
    k.happy = ease(k.happy, k.hover || giggle >= 0 ? 1 : 0, 10);
    brows.current.position.y = 0.03 * k.think + 0.015 * k.happy;

    k.bloom = ease(k.bloom, mood === "answering" ? 0.05 : 0.025 * k.happy, 8);
    const shake = fidgeting("petals", 1.6) >= 0 ? 1 : 0;
    petalSways.current.forEach((sway, i) => {
      const wave = animate ? (0.03 + 0.09 * Math.max(k.think, shake)) * Math.sin(t * (1.6 + 4 * Math.max(k.think, shake)) - i * 0.7) : 0;
      const flutter = sincePoke < 1.5 ? 0.12 * Math.exp(-sincePoke * 4) * Math.sin(sincePoke * 25 + i) : 0;
      sway.rotation.z = wave + flutter;
      sway.children[0].position.y = k.bloom;
    });

    // Blink every 2–6s, sometimes twice
    if (animate && t - k.start > k.nextBlink) {
      k.blinkAt = t;
      k.nextBlink = t - k.start + (Math.random() < 0.2 ? 0.25 : 2 + Math.random() * 4);
    }
    const sinceBlink = t - k.blinkAt;
    const lid = sinceBlink < 0.16 ? Math.abs(Math.cos((sinceBlink / 0.16) * Math.PI)) : 1;
    eyes.current.scale.y = Math.max(lid * (1 - 0.15 * k.happy), 0.1);
    // Mouth: a new expression with each glance, wide open when happy, poked or fidgeting, chatters while answering or giggling
    const talk = animate ? 0.3 + 0.7 * Math.abs(Math.sin(t * 11)) * (0.6 + 0.4 * Math.sin(t * 3.7)) : 1;
    const excited = sincePoke < 0.9 || sinceFidget < 1.6;
    const rest = (following ? 0.4 : k.glance.mouth) + (animate ? 0.06 * Math.sin(t * 1.6) : 0);
    const open = mood === "answering" || giggle >= 0 ? talk : mood === "thinking" ? 0 : excited ? 1 : lerp(rest, 0.9, k.happy);
    k.open = ease(k.open, open, 18);
    mouth.current.children.forEach((part) => {
      if (part instanceof THREE.Mesh) part.morphTargetInfluences![0] = 1 - k.open;
    });

    // Wave the right arm when answering, when jumping, and sometimes just to say hi
    const jump = poked("jump", 0.7);
    const hi = fidgeting("wave", 1.6);
    k.wave = ease(k.wave, mood === "answering" || jump >= 0 ? 1 : hi >= 0 ? 0.65 : 0, 6);
    waveArm.current.rotation.z = lerp(ARM_REST, 2.5, k.wave) + (animate ? 0.25 * k.wave * Math.sin(t * 10) : 0);

    // Hops, and a full turn when spun
    const spin = poked("spin", 0.9);
    root.current.rotation.y = k.yaw + (spin >= 0 ? Math.PI * 2 * easeInOut(spin / 0.9) : 0);
    const hop = animate ? k.hopHeight * pulse(t - k.hopAt, 0.45) : 0;
    root.current.position.y = ROOT_Y + hop;
    shadow.current.scale.set(0.6 * size * (1 - hop * 2), 0.36 * size * (1 - hop * 2), 1);

    if (!k.ready) {
      k.ready = true;
      onReady();
    }
  });

  const poke = () => {
    const k = timing.current;
    k.poke = pick(POKES, k.poke);
    k.pokeAt = now();
    if (k.poke === "jump") Object.assign(k, { hopAt: k.pokeAt, hopHeight: 0.16 });
    if (k.poke === "spin") Object.assign(k, { hopAt: k.pokeAt, hopHeight: 0.06 });
    invalidate();
  };
  const hover = (on: boolean) => {
    timing.current.hover = on;
    document.body.style.cursor = on ? "pointer" : "";
  };

  return (
    <>
      <group ref={root}>
        <group ref={body} onPointerDown={poke} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
          <group ref={head} position={[0, HEAD_Y, 0]}>
            <Petals kit={kit} sways={petalSways} />
            <Head kit={kit} />
            <Eyes ref={eyes} kit={kit} gaze={gaze} />
            <Brows ref={brows} kit={kit} />
            <Mouth ref={mouth} kit={kit} />
          </group>
          <Body kit={kit} />
          <Arms kit={kit} waveArm={waveArm} />
          <Leaf kit={kit} />
        </group>
      </group>
      <Ground ref={shadow} kit={kit} />
    </>
  );
}

export default function AdeyScene({ mood, animate, active, onReady }: ParamType) {
  return (
    <Canvas
      frameloop={!animate ? "demand" : active ? "always" : "never"}
      dpr={[1, 1.75]}
      shadows
      // fov 30 at z 4.2 shows 2.25 units; Adey is about 1.9 tall
      camera={{ fov: 30, position: [0, 0, 4.2] }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        // Neutral keeps Petal and Seed close to their brand values
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Studio />
      <Adey mood={mood} animate={animate} onReady={onReady} />
    </Canvas>
  );
}
