import React from "react";

// A titled band: heading and rule above, content below
export default function Section({
  id,
  title,
  rule,
  children,
}: {
  id: string;
  title: string;
  rule: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="space-y-12 py-24 lg:space-y-16 lg:py-32"
    >
      <div className="reveal max-w-[40rem] space-y-4">
        <h2
          id={`${id}-title`}
          className="text-balance text-4xl font-extrabold lg:text-5xl leading-[1.05] tracking-[-0.03em]"
        >
          {title}
        </h2>
        <div className="max-w-[40ch] text-lg">{rule}</div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
