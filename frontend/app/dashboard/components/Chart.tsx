"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  LineChart,
  Title,
  Text,
  Metric,
  Flex,
  ProgressBar,
  Subtitle,
  DonutChart,
} from "@tremor/react";
import {
  DashboardChatBotType,
  DashboardDataType,
  DashboardMessageType,
} from "@/app/types/types";
import LineChartToolTip from "./LineChartToolTip";
import Dropdown from "@/app/components/Dropdown";

const valueFormatter = (number: number) =>
  new Intl.NumberFormat("us").format(number).toString();
type Props = {
  data: DashboardDataType;
};

const Chart = ({ data }: Props) => {
  const [chartKey, setChartKey] = useState<string>("All");
  const [chartData, setChartData] = useState<DashboardMessageType[]>(
    data.message_statistics
  );
  const [chat, setChat] = useState<DashboardChatBotType>();
  console.log(data.message_statistics);

  useEffect(() => {
    if (chartKey === "All") {
      setChartData(data.message_statistics);
    } else {
      const chat_statistics = data.chat_statistics.find(
        (predicate) => predicate.name === chartKey
      );
      if (chat_statistics) {
        setChat(chat_statistics);
        setChartData(chat_statistics.message_data);
      }
    }
  }, [chartKey]);
  return (
    <div className="bg-white px-7 py-6 rounded-lg">
      <div className="flex flex-row justify-between w-full">
        <div>
          <Text>Api Usage</Text>
          <Metric>
            {chartKey == "All"
              ? data?.total_messages_count
              : chat?.message_count}{" "}
            Requests
          </Metric>
        </div>
        <Dropdown
          value={chartKey}
          items={["All", ...(data?.chat_statistics.map((cs) => cs.name) || [])]}
          set_value={setChartKey}
        />
      </div>

      <Flex className="mt-4">
        <Text>
          {(
            (data?.total_messages_count || 0) /
            (data?.user_plan.max_request_per_month || 0)
          ).toFixed(2)}
          % of total usage
        </Text>
        <Text>{data?.user_plan.max_request_per_month}</Text>
      </Flex>
      <ProgressBar
        value={Math.floor(
          (data?.total_messages_count || 0) /
            (data?.user_plan.max_request_per_month || 0)
        )}
        className="mt-2"
        // @ts-ignore
        color={"amber-300"}
      />
      <div className="h-2" />
      <LineChart
        className="mt-6"
        data={chartData}
        index="date"
        categories={["count"]}
        colors={["amber-300"]}
        valueFormatter={valueFormatter}
        yAxisWidth={40}
        showLegend={false}
        customTooltip={LineChartToolTip}
      />
    </div>
  );
};

export default Chart;
