"use client";

import React, { useEffect, useState } from "react";
import { LineChart } from "@tremor/react";
import {
  DashboardChatBotType,
  DashboardDataType,
  DashboardMessageType,
} from "@/app/types/types";
import LineChartToolTip from "./LineChartToolTip";
import Dropdown from "@/app/components/Dropdown";
import { Activity } from "lucide-react";

const valueFormatter = (number: number) =>
  new Intl.NumberFormat("us").format(number).toString();

type Props = {
  data: DashboardDataType;
};

const Chart = ({ data }: Props) => {
  const [chartKey, setChartKey] = useState<string>("All");
  const [chartData, setChartData] = useState<DashboardMessageType[]>(
    data?.message_statistics || []
  );
  const [chat, setChat] = useState<DashboardChatBotType>();

  useEffect(() => {
    if (chartKey === "All") {
      setChartData(data?.message_statistics || []);
      setChat(undefined);
    } else {
      const chat_statistics = data?.chat_statistics.find(
        (predicate) => predicate.name === chartKey
      );
      if (chat_statistics) {
        setChat(chat_statistics);
        setChartData(chat_statistics.message_data);
      }
    }
  }, [chartKey, data]);

  const currentCount =
    chartKey === "All" ? data?.total_messages_count : chat?.message_count;
  const maxRequests = data?.user_plan?.max_request_per_month || 1;
  const usagePercentage = Math.min(
    ((data?.total_messages_count || 0) / maxRequests) * 100,
    100
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Usage</h2>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {currentCount ?? 0}
              <span className="text-base font-normal text-gray-500 ml-2">
                requests
              </span>
            </p>
          </div>
        </div>
        <Dropdown
          value={chartKey}
          items={["All", ...(data?.chat_statistics?.map((cs) => cs.name) || [])]}
          set_value={setChartKey}
        />
      </div>

      {/* Usage Bar */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {usagePercentage.toFixed(1)}% of monthly quota used
          </span>
          <span className="text-sm font-medium text-gray-900">
            {data?.total_messages_count || 0} / {maxRequests}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-200">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 ? (
        <LineChart
          className="h-72"
          data={chartData}
          index="date"
          categories={["count"]}
          colors={["amber"]}
          valueFormatter={valueFormatter}
          yAxisWidth={48}
          showLegend={false}
          showAnimation={true}
          curveType="monotone"
          customTooltip={LineChartToolTip}
        />
      ) : (
        <div className="h-72 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              No usage data available for this period
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;
