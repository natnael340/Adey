import { PlanType } from "../types/types";

export const [HUMAN, AI] = ["HUMAN", "AI"];
export const COLORS = [
  "red-500",
  "orange-500",
  "amber-500",
  "lime-500",
  "green-500",
  "emerald-500",
  "teal-500",
  "cyan-500",
  "sky-500",
  "blue-500",
  "indigo-500",
  "violet-500",
  "purple-500",
  "fuchsia-500",
  "pink-500",
  "rose-500",
  "stone-500",
  "slate-800",
];

export const TEST_PLAN: PlanType[] = [
  {
    name: "Basic",
    identifier: "1",
    price: 300,
    max_chatbot: 3,
    max_user_session: 200,
    max_request_per_month: 500,
    max_webapp_per_bot: 1,
    period: "monthly",
  },
  {
    name: "Standard",
    identifier: "1",
    price: 300,
    max_chatbot: 3,
    max_user_session: 200,
    max_request_per_month: 500,
    max_webapp_per_bot: 1,
    period: "monthly",
  },
  {
    name: "Premium",
    identifier: "1",
    price: 300,
    max_chatbot: 3,
    max_user_session: 200,
    max_request_per_month: 500,
    max_webapp_per_bot: 1,
    period: "monthly",
  },
];

export const PaypalOptions = {
  clientId: process.env.PAYPAL_CLIENT_ID || "test_id",
  enableFunding: "paylater,card",
  disableFunding: "",
  dataSdkIntegrationSource: "integrationbuilder_sc",
  vault: "true",
  intent: "subscription",
};
