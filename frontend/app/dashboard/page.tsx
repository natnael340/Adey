"use client";

import Layout from "./_layout";
import { FaRobot, FaUser, FaAngleRight } from "react-icons/fa";
import { SiSalesforce } from "react-icons/si";
import { IoIosChatboxes } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
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
} from "../types/types";
import { useEffect, useState } from "react";
import Api from "../components/Api";
import LineChartToolTip from "./components/LineChartToolTip";
import Dropdown from "../components/Dropdown";
import { stringToColor } from "../components/utils";

const valueFormatter = (number: number) =>
  new Intl.NumberFormat("us").format(number).toString();

const Page = () => {
  const [api, setApi] = useState<Api | null>(null);
  const [data, setData] = useState<DashboardDataType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [chartKey, setChartKey] = useState<string>("All");
  const [chartData, setChartData] = useState<DashboardMessageType[]>([]);
  const [chat, setChat] = useState<DashboardChatBotType>();

  const fetchDashboardData = async (_api: Api) => {
    console.log("fetchDashboardData");
    try {
      setLoading(true);
      const data = await _api.get_dashboard();
      setData(data);
      setChartData(data.message_statistics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("no api");
    if (api) {
      console.log("api");
      fetchDashboardData(api);
    }
  }, [api]);

  useEffect(() => {
    if (data) {
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
    }
  }, [chartKey]);

  return (
    <Layout page="dashboard" set_api={setApi} loading={loading}>
      <div className="container space-y-5">
        <div className="flex flex-row justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl text-[#15192C]">Dashboard</h1>
            <p className="text-[#92959E] text-sm">
              Information on usage of deployed bots
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 w-full py-5">
          <div className="col-span-2 space-y-5">
            <div className="flex flex-row items-center justify-between bg-white px-4 py-6 rounded-lg divide-x">
              <div className="flex flex-row gap-x-3 px-2">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-[#FFFFF0]">
                  <FaRobot size={20} color="#E3C326" />
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-[#92959E]">Chat Bots</p>
                  <p>{data?.total_chat_bots_count}</p>
                </div>
              </div>
              <div className="flex flex-row gap-x-3 px-2">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-[#FFFFF0]">
                  <SiSalesforce size={20} color="#E3C326" />
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-[#92959E]">Sales Bots</p>
                  <p>0</p>
                </div>
              </div>
              <div className="flex flex-row gap-x-3 px-2">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-[#FFFFF0]">
                  <FaUser size={20} color="#E3C326" />
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-[#92959E]">Total Session</p>
                  <p>{data?.total_sessions_count}</p>
                </div>
              </div>
              <div className="flex flex-row gap-x-3 px-2">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-[#FFFFF0]">
                  <IoIosChatboxes size={20} color="#E3C326" />
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-[#92959E]">Total Chats</p>
                  <p>{data?.total_chats_count}</p>
                </div>
              </div>
            </div>
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
                  items={[
                    "All",
                    ...(data?.chat_statistics.map((cs) => cs.name) || []),
                  ]}
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
            <div className="grid grid-cols-2 gap-x-5">
              <div className="bg-white px-7 py-6 rounded-lg space-y-5">
                <div>
                  <Title>Request Distribution</Title>
                  <Subtitle>Request usage between chats</Subtitle>
                </div>
                <div className="grid grid-cols-2 items-center w-full gap-x-3 ">
                  <div className="space-y-3">
                    {data?.chat_statistics.map((_chat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex flex-row items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-${stringToColor(
                              _chat.name
                            )}`}
                          />
                          <p className="truncate">{_chat.name}</p>
                        </div>
                        <p className="ml-4">
                          {(
                            (_chat.message_count / data.total_messages_count) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    ))}
                  </div>
                  <DonutChart
                    data={data?.chat_statistics || []}
                    category="message_count"
                    index="name"
                    valueFormatter={valueFormatter}
                    colors={
                      data?.chat_statistics.map((_chat) =>
                        stringToColor(_chat.name)
                      ) || []
                    }
                  />
                </div>
              </div>
              <div className="bg-white px-7 py-6 rounded-lg space-y-4">
                <div>
                  <Title>Pricing Plan</Title>
                  <Subtitle>Your current subscription plan</Subtitle>
                </div>
                <div className="flex justify-between items-center hover:bg-slate-50 hover:cursor-pointer rounded-xl">
                  <div className="flex flex-row space-x-3">
                    <div className="w-16 h-16 rounded-xl bg-[#F1FBFF] flex justify-center items-center">
                      <HiUsers color="#00B7FE" size={24} />
                    </div>
                    <div className="flex flex-col justify-evenly">
                      <div>
                        <p className="text-[#15192C]">
                          {data?.user_plan.name} Plan
                        </p>
                      </div>
                      <div>
                        <p className="text-[#15192C]">
                          ${data?.user_plan.price}/mo
                        </p>
                      </div>
                    </div>
                  </div>
                  <FaAngleRight />
                </div>
                <div className="grid grid-rows-3 gap-y-3">
                  <div className="space-y-1">
                    <Flex>
                      <Text>Chat Bots</Text>
                      <Text>
                        {data?.total_chat_bots_count}/
                        {data?.user_plan.max_chatbot}
                      </Text>
                    </Flex>
                    <ProgressBar
                      value={
                        Math.floor(
                          (data?.total_chat_bots_count || 0) /
                            (data?.user_plan.max_chatbot || 0)
                        ) * 100
                      }
                      // @ts-ignore
                      color="orange-500"
                      className="bg-[#FFF7F0]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Flex>
                      <Text>Allowed Urls</Text>
                      <Text>
                        4/
                        {(data?.user_plan.max_webapp_per_bot || 0) *
                          (data?.user_plan.max_chatbot || 0)}
                      </Text>
                    </Flex>
                    <ProgressBar
                      value={Math.floor((4 / 5) * 100)}
                      // @ts-ignore
                      color="violet-700"
                      className="bg-[#F3F0FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Flex>
                      <Text>Request/mo</Text>
                      <Text>
                        {data?.total_messages_count}/
                        {data?.user_plan.max_request_per_month}
                      </Text>
                    </Flex>
                    <ProgressBar
                      value={Math.floor(
                        ((data?.total_messages_count || 0) /
                          (data?.user_plan.max_request_per_month || 0)) *
                          100
                      )}
                      // @ts-ignore
                      color="rose-600"
                      className="bg-[#FFF2F5]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-6 rounded-lg min-h-[35rem]">
            <h4 className="text-lg">Frequent Question</h4>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
