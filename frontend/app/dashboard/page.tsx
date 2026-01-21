import {
  BotMessageSquare,
  CircleUser,
  TrendingUp,
  ChevronRight,
  Users,
  MessageSquareMore,
  Sparkles,
} from "lucide-react";
import { DonutChart } from "@tremor/react";

import React from "react";
import { stringToColor } from "../components/utils";
import Chart from "./components/Chart";
import { authApi } from "../components/protected_api";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
  iconColor: string;
};

const StatCard = ({ icon, label, value, bgColor, iconColor }: StatCardProps) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-4">
      <div
        className={`flex justify-center items-center w-12 h-12 rounded-xl ${bgColor}`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          size: 22,
          className: iconColor,
        })}
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  </div>
);

type ProgressBarProps = {
  label: string;
  current: number;
  max: number;
  color: string;
  bgColor: string;
};

const CustomProgressBar = ({
  label,
  current,
  max,
  color,
  bgColor,
}: ProgressBarProps) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        <span className="text-sm text-gray-900 font-semibold">
          {current}/{max}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${bgColor}`}>
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const Page = async () => {
  const api = await authApi();
  const data = await api.get_dashboard();

  const stats = [
    {
      icon: <BotMessageSquare />,
      label: "Chat Bots",
      value: data?.total_chat_bots_count ?? 0,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      icon: <TrendingUp />,
      label: "Sales Bots",
      value: 0,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      icon: <CircleUser />,
      label: "Total Sessions",
      value: data?.total_sessions_count ?? 0,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: <MessageSquareMore />,
      label: "Total Chats",
      value: data?.total_chats_count ?? 0,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <main className="min-h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              Monitor your bot performance and usage metrics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Chart */}
        <Chart data={data} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Request Distribution
              </h2>
              <p className="text-sm text-gray-500">
                Request usage across your bots
              </p>
            </div>

            {data?.chat_statistics && data.chat_statistics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
                <div className="space-y-4 order-2 sm:order-1">
                  {data.chat_statistics.map((_chat, idx) => {
                    const percentage =
                      data.total_messages_count > 0
                        ? (
                            (_chat.message_count / data.total_messages_count) *
                            100
                          ).toFixed(1)
                        : "0";
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full bg-${stringToColor(
                              _chat.name
                            )}`}
                          />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                            {_chat.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="order-1 sm:order-2 flex justify-center">
                  <DonutChart
                    data={data.chat_statistics}
                    category="message_count"
                    index="name"
                    colors={data.chat_statistics.map((_chat) =>
                      stringToColor(_chat.name)
                    )}
                    className="h-40"
                    showAnimation={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No data available yet. Start using your bots to see
                  distribution.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Plan */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Plan
              </h2>
              <p className="text-sm text-gray-500">
                Current subscription and usage
              </p>
            </div>

            {/* Plan Card */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-6 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex justify-center items-center">
                  <Users className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {data?.user_plan.name} Plan
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${data?.user_plan.price}
                    <span className="text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>

            {/* Usage Bars */}
            <div className="space-y-5">
              <CustomProgressBar
                label="Chat Bots"
                current={data?.total_chat_bots_count ?? 0}
                max={data?.user_plan.max_chatbot ?? 0}
                color="bg-amber-500"
                bgColor="bg-amber-100"
              />
              <CustomProgressBar
                label="Allowed URLs"
                current={4}
                max={
                  (data?.user_plan.max_webapp_per_bot ?? 0) *
                  (data?.user_plan.max_chatbot ?? 0)
                }
                color="bg-violet-500"
                bgColor="bg-violet-100"
              />
              <CustomProgressBar
                label="Requests / Month"
                current={data?.total_messages_count ?? 0}
                max={data?.user_plan.max_request_per_month ?? 0}
                color="bg-rose-500"
                bgColor="bg-rose-100"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
