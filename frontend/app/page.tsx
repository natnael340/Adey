import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { brandFonts } from "./fonts";
import { cn } from "@/lib/utils";
import HeroDemo from "./components/landing/HeroDemo";
import SetupSequence from "./components/landing/SetupSequence";
import SourceCarousel from "./components/landing/SourceCarousel";
import Button, { focusRing } from "./components/brand/Button";
import Section from "./components/brand/Section";

// Edge to edge with a fluid gutter (--gutter, globals.css): no centred max-width column
const shell = "px-[var(--gutter)]";

const navLink = cn(
  "rounded-control font-medium hover:underline hover:underline-offset-[3px]",
  focusRing(true),
);

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    // Root is <main>, not <div>: the chat widget prepends a <div> to <body> before hydration.
    // Colours are the Adey Abeba's own: yellow petals on the green highlands, with a brown seed
    <main
      data-canvas="highland"
      className={cn(
        brandFonts,
        "min-h-screen bg-adey-paper font-grotesk text-adey-seed antialiased",
      )}
    >
      <header className="sticky top-0 z-40 bg-adey-highland text-adey-paper">
        <div
          className={cn(
            shell,
            "flex h-[4.5rem] items-center justify-between gap-6",
          )}
        >
          <Link href="/" className={cn("rounded-control", focusRing(true))}>
            <img
              src="/brand/adey-lockup-horizontal-reversed.svg"
              alt="Adey"
              className="h-8 w-auto"
            />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-6">
            <Link href="/features" className={cn(navLink, "hidden sm:inline")}>
              Features
            </Link>
            {session ? (
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className={navLink}>
                Sign in
              </Link>
            )}
            <Button
              href="/auth/signup"
              onDark
              className="hidden md:inline-flex"
            >
              Create your assistant
            </Button>
          </nav>
        </div>
      </header>

      <section
        aria-label="Adey"
        className={cn(
          shell,
          "overflow-hidden bg-adey-highland text-adey-paper",
        )}
      >
        <HeroDemo>
          <h1 className="max-w-[14ch] text-balance text-[11vw] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-[clamp(3.5rem,6vw,6.5rem)]">
            Answers from your own files
          </h1>
          <p className="mt-8 max-w-[46ch] text-lg sm:text-xl">
            Adey is a chat assistant for your website. It reads your price
            lists, policies and FAQs, answers customers at any hour, checks
            orders, books appointments, and shows where every answer came from.
          </p>
          <Button href="/auth/signup" onDark className="mt-8">
            Create your assistant
          </Button>
        </HeroDemo>
      </section>

      {/* One light chapter between the green hero and the green close: sources on white, setup a tone down */}
      <div className={cn(shell, "bg-adey-paper")}>
        <Section
          id="sources"
          title="Where answers come from"
          rule={
            <p>
              Adey answers from what you give it. When it can&apos;t help, it
              hands the conversation to your team.
            </p>
          }
        >
          <SourceCarousel />
        </Section>
      </div>

      <div className={cn(shell, "bg-adey-meadow")}>
        <Section
          id="setup"
          title="Live on your site in three steps"
          rule={
            <p>No code until the last step, and then it&apos;s two lines.</p>
          }
        >
          <SetupSequence />
        </Section>
      </div>

      <div className={cn(shell, "bg-adey-highland text-adey-paper")}>
        <Section
          id="start"
          title="Start with one document"
          rule={
            <p>
              Upload your returns policy or price list and ask Adey about it
              before you put it on your site.
            </p>
          }
        >
          <Button href="/auth/signup" onDark>
            Create your assistant
          </Button>
        </Section>

        <footer className="pb-14">
          <img
            src="/brand/adey-lockup-horizontal-reversed.svg"
            alt="Adey"
            className="h-10 w-auto"
          />
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/features" className={navLink}>
                Features
              </Link>
              <Link href="/privacy" className={navLink}>
                Privacy
              </Link>
              <Link href="/tos" className={navLink}>
                Terms
              </Link>
              <a href="https://github.com/natnael340/Adey" className={navLink}>
                GitHub
              </a>
            </nav>
            <p>© {new Date().getFullYear()} Adey</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
