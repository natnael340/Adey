"use client";

import React, { useEffect, useState } from "react";
import ChatBubble from "../components/brand/ChatBubble";
import DocumentSheet from "../components/brand/DocumentSheet";
import Highlight from "../components/brand/Highlight";
import SourceChip from "../components/brand/SourceChip";
import Button from "../components/brand/Button";

// The one idea the system carries: the answer, and the line it came from
export default function AnswerDemo() {
  const [run, setRun] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setAnswered(false);
    const t = setTimeout(() => setAnswered(true), 1400);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className="space-y-3" aria-live="polite">
        <ChatBubble speaker="customer">Can I return a laptop I already opened?</ChatBubble>
        {answered ? (
          <div>
            <ChatBubble speaker="bot">
              Yes, within 14 days of delivery. Opened items are exchanged rather than refunded,
              so bring the charger and anything else that came in the box.
            </ChatBubble>
            <SourceChip fileName="returns-policy.pdf" page={2} targetId="demo-source" />
          </div>
        ) : (
          <ChatBubble speaker="bot" typing />
        )}
        <div className="pt-4">
          <Button variant="link" onClick={() => setRun((r) => r + 1)}>
            Replay the answer
          </Button>
        </div>
      </div>

      <DocumentSheet fileName="returns-policy.pdf" page={2}>
        <p>
          Unopened items can be returned within 30 days of delivery for a full refund to the
          original payment method.
        </p>
        <p>
          {answered ? (
            <Highlight key={run} id="demo-source" animate>
              Opened items can be exchanged within 14 days of delivery, provided all original
              accessories are included.
            </Highlight>
          ) : (
            <span>
              Opened items can be exchanged within 14 days of delivery, provided all original
              accessories are included.
            </span>
          )}
        </p>
        <p>Gift cards, software licences and earphones cannot be returned once opened.</p>
      </DocumentSheet>
    </div>
  );
}
