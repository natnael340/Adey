import React from "react";
import type { Metadata } from "next";
import { brandFonts } from "../fonts";
import { cn } from "@/lib/utils";
import AnswerDemo from "./AnswerDemo";
import Button, { focusRing } from "../components/brand/Button";
import ChatBubble from "../components/brand/ChatBubble";
import CodeBlock from "../components/brand/CodeBlock";
import DocumentSheet from "../components/brand/DocumentSheet";
import Highlight from "../components/brand/Highlight";
import Steps from "../components/brand/Steps";
import Section from "../components/brand/Section";
import { EMBED_CODE } from "../constants/consts";

export const metadata: Metadata = {
  title: "Adey style guide",
  robots: { index: false, follow: false },
};

// Swatch width is how much of the page each colour should cover
const palette = [
  { name: "Meadow", hex: "#F3F6EE", cls: "bg-adey-meadow", share: 38, role: "Page background." },
  { name: "Paper", hex: "#FFFFFF", cls: "bg-adey-paper", share: 18, role: "Document sheets and Adey's chat bubbles. Nothing else." },
  { name: "Mist", hex: "#D5DDCF", cls: "bg-adey-mist", share: 10, role: "Rules and dividers. Too light for input outlines; use Seed at 60%." },
  { name: "Seed", hex: "#3A2614", cls: "bg-adey-seed", share: 14, role: "All text. The brown of the flower's centre stands in for black." },
  { name: "Highland", hex: "#1E4D3A", cls: "bg-adey-highland", share: 13, role: "Dark bands, links, focus rings, customer bubbles and code." },
  { name: "Petal", hex: "#F2C230", cls: "bg-adey-petal", share: 6, role: "The highlighter, and the primary button. Never text." },
  { name: "Alert", hex: "#B3261E", cls: "bg-adey-alert", share: 1, role: "Form errors only." },
];

const scale = [
  { px: 72, use: "Display, the hero only. 48 on phones", cls: "text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[4.5rem] sm:leading-[0.95] sm:tracking-[-0.03em]", sample: "Your documents, answering" },
  { px: 48, use: "Page title", cls: "text-5xl font-extrabold leading-[1.05] tracking-[-0.02em]", sample: "Set up your assistant" },
  { px: 36, use: "Section heading", cls: "text-4xl font-extrabold leading-tight tracking-[-0.02em]", sample: "What Adey can do" },
  { px: 24, use: "Subheading", cls: "text-2xl font-bold leading-snug", sample: "Book appointments in the chat" },
  { px: 18, use: "Lead paragraph, step titles", cls: "text-lg leading-normal", sample: "Upload your price lists and policies. Adey answers from them." },
  { px: 16, use: "Body", cls: "text-base leading-normal", sample: "Customers ask in their own words. Adey finds the passage that answers them." },
  { px: 14, use: "Captions and meta", cls: "text-sm leading-normal", sample: "Last updated 3 hours ago" },
];

const voice = [
  { avoid: "Transform your company with AI-powered chatbot", use: "Your documents, answering your customers" },
  { avoid: "Submit", use: "Create your assistant" },
  { avoid: "Oops! Something went wrong 😕", use: "We couldn't read invoice.pdf. Upload it as a PDF under 20 MB." },
  { avoid: "No data yet", use: "No conversations yet. Paste the embed code on your site to start." },
  { avoid: "Configure webhook integrations", use: "Let Adey look up orders in your system" },
];


export default function StyleGuide() {
  return (
    // Root is <main>, not <div>: the chat widget prepends a <div> to <body> before hydration
    <main
      data-canvas="meadow"
      className={cn(brandFonts, "min-h-screen bg-adey-meadow font-grotesk text-adey-seed antialiased")}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <header className="flex items-center gap-3 py-6">
          <img src="/adey_logo.png" alt="" className="h-8 w-8" />
          <span className="text-lg font-extrabold tracking-[-0.02em]">Adey</span>
        </header>

        <div className="pb-14 pt-8 lg:pb-20 lg:pt-14">
          <h1 className="max-w-[16ch] text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[4.5rem] sm:leading-[0.95] sm:tracking-[-0.03em]">
            Adey style guide
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg">
            Adey answers a business&apos;s customers from that business&apos;s own documents. The
            whole system exists to make that visible: yellow, from the Adey Abeba flower, marks
            the passage an answer came from, and nothing else gets to use it that way.
          </p>
          <div className="mt-12">
            <AnswerDemo />
          </div>
        </div>

        <Section
          id="colour"
          title="Colour"
          rule={
            <p>
              Taken from the flower and the highlands it grows on. The bar shows roughly how
              much of a page each colour should cover.
            </p>
          }
        >
          <div className="flex h-24 overflow-hidden rounded-control border border-adey-mist" aria-hidden>
            {palette.map((c) => (
              <div key={c.name} className={c.cls} style={{ width: `${c.share}%` }} />
            ))}
          </div>
          <dl className="mt-8 divide-y divide-adey-mist">
            {palette.map((c) => (
              <div key={c.name} className="grid grid-cols-[1.5rem_6rem_minmax(0,1fr)] items-baseline gap-x-4 py-3 sm:grid-cols-[1.5rem_8rem_6rem_minmax(0,1fr)]">
                <span className={cn("h-4 w-4 self-center rounded-full border border-adey-seed/15", c.cls)} />
                <dt className="font-bold">{c.name}</dt>
                <dd className="hidden tabular-nums text-adey-seed/70 sm:block">{c.hex}</dd>
                <dd className="text-adey-seed/85">
                  <span className="text-adey-seed/70 sm:hidden"><span className="tabular-nums">{c.hex}</span>. </span>
                  {c.role}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[60ch] text-sm text-adey-seed/70">
            Contrast: Seed on Meadow 13.1:1, Seed on Petal 8.5:1, Meadow on Highland 8.8:1,
            Petal focus ring on Highland 5.8:1.
          </p>
        </Section>

        <Section
          id="type"
          title="Type"
          rule={
            <>
              <p>
                Schibsted Grotesk is Adey speaking: interface, headings, body.
              </p>
              <p className="mt-3">
                Newsreader is the customer&apos;s business speaking. Use it only for text quoted
                from their documents.
              </p>
            </>
          }
        >
          <ol className="space-y-8">
            {scale.map((s) => (
              <li key={s.px} className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
                <span className="text-sm text-adey-seed/70">
                  <span className="tabular-nums">{s.px}px</span>
                  <span className="block">{s.use}</span>
                </span>
                <span className={cn("block break-words", s.cls)}>{s.sample}</span>
              </li>
            ))}
          </ol>
          <DocumentSheet fileName="opening-hours.docx" className="mt-14">
            <p>
              Our showroom is open Monday to Saturday, 9:00 to 19:00. On public holidays we
              open at 11:00. Repairs can be dropped off at the side entrance until 17:00.
            </p>
          </DocumentSheet>
          <p className="mt-4 max-w-[60ch] text-sm text-adey-seed/70">
            Newsreader at 17px with 1.65 line height. Labels everywhere are sentence case,
            never all caps. Keep body text under 66 characters a line.
          </p>
        </Section>

        <Section
          id="shape"
          title="Shape and depth"
          rule={
            <p>
              Rounding follows what the thing is. Only paper casts a shadow, because it&apos;s
              the only thing that sits on top of the page.
            </p>
          }
        >
          <div className="grid gap-10 sm:grid-cols-3">
            <div className="space-y-4">
              <Button>Save changes</Button>
              <p className="text-sm text-adey-seed/70">Controls: 4px</p>
            </div>
            <div className="space-y-4">
              <ChatBubble speaker="bot">Which day suits you?</ChatBubble>
              <ChatBubble speaker="customer">Thursday morning</ChatBubble>
              <p className="text-sm text-adey-seed/70">
                Bubbles: 14px, squared at the speaker&apos;s corner
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-24 rounded-sheet bg-adey-paper shadow-sheet" />
              <p className="text-sm text-adey-seed/70">Sheets: 2px, the only shadow</p>
            </div>
          </div>
        </Section>

        <Section
          id="motion"
          title="Motion"
          rule={
            <p>
              The highlight sweeps across the source line when Adey answers, Adey itself, the 3D
              character on the home page, reacts to the visitor and the conversation, and
              sections rise in once as they scroll into view. With reduced motion all of it
              holds still.
            </p>
          }
        >
          <p className="max-w-[60ch] font-document text-[1.0625rem] leading-[1.65]">
            Local delivery is free on orders over $50.{" "}
            <Highlight animate>Orders placed before 14:00 arrive the same day.</Highlight>
          </p>
          <p className="mt-4 text-sm text-adey-seed/70">600ms, ease-out, left to right.</p>
        </Section>

        <Section
          id="components"
          title="Components"
          rule={<p>Built from the tokens above. Find them in app/components/brand.</p>}
        >
          <div className="space-y-16">
            <div className="space-y-5">
              <h3 className="text-lg font-bold">Buttons and links</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="/auth/signup">Create your assistant</Button>
                <Button variant="secondary" href="/auth/login">Sign in</Button>
                <Button variant="link" href="#components">Read the setup guide</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-control bg-adey-highland p-6">
                <Button onDark href="/auth/signup">Create your assistant</Button>
                <Button
                  variant="secondary"
                  onDark
                  href="/auth/login"
                  className="text-adey-meadow hover:bg-adey-meadow/10"
                >
                  Sign in
                </Button>
              </div>
              <p className="max-w-[60ch] text-sm text-adey-seed/70">
                Name the action. Press Tab to see focus: a Highland ring, or Petal on dark bands.
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-bold">Setup steps</h3>
              <Steps
                steps={[
                  {
                    title: "Upload your documents",
                    body: "Price lists, policies, FAQs and product sheets. PDF, Word or a web page.",
                  },
                  {
                    title: "Choose where Adey can appear",
                    body: "Add the websites allowed to load your assistant.",
                  },
                  {
                    title: "Paste the embed code",
                    body: <CodeBlock label="Add to your site's <head>" code={EMBED_CODE} className="mt-3" />,
                  },
                ]}
              />
              <p className="max-w-[60ch] text-sm text-adey-seed/70">
                Numbers only where order matters. Code blocks are the one place monospace is used.
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-bold">Form field</h3>
              <div className="grid max-w-md gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="sg-name" className="block font-medium">
                    Business name
                  </label>
                  <input
                    id="sg-name"
                    defaultValue="Tana Electronics"
                    className={cn(
                      "w-full rounded-control border-[1.5px] border-adey-seed/60 bg-adey-paper px-3 py-2.5 hover:border-adey-seed",
                      focusRing()
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sg-email" className="block font-medium">
                    Work email
                  </label>
                  <input
                    id="sg-email"
                    defaultValue="tana.electronics"
                    aria-invalid
                    aria-describedby="sg-email-error"
                    className={cn(
                      "w-full rounded-control border-[1.5px] border-adey-alert bg-adey-paper px-3 py-2.5",
                      focusRing()
                    )}
                  />
                  <p id="sg-email-error" className="text-sm text-adey-alert">
                    Enter an email address, like you@shop.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="voice"
          title="Voice"
          rule={
            <p>
              Plain, specific and in sentence case. Say what happened and what to do next. An
              action keeps its name: Create your assistant, then Assistant created.
            </p>
          }
        >
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-adey-mist text-sm text-adey-seed/70">
                <th scope="col" className="pb-3 pr-4 font-medium">Instead of</th>
                <th scope="col" className="pb-3 font-medium">Write</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-adey-mist">
              {voice.map((v) => (
                <tr key={v.use} className="align-top">
                  <td className="py-4 pr-4 text-adey-seed/60 line-through decoration-adey-seed/30">{v.avoid}</td>
                  <td className="py-4 font-medium">{v.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </main>
  );
}
