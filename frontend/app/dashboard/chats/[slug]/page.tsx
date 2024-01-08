"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../_layout";
import { ChatDetailType, ChatType } from "@/app/types/types";
import Api from "@/app/components/Api";
import { Button, Dropdown, Spinner, Table, TextInput } from "flowbite-react";
import Image from "next/image";
import { IoAdd } from "react-icons/io5";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";

type PropType = {
  params: {
    slug: string;
  };
};
const DATA = {
  assistant_name: "Julian Marqueze",
  assistant_description:
    "As a PrintAvenue customer support bot, your goal is to provide accurate and helpful information about PrintAvenue, " +
    "a print on demand businsess which desing, and print unique design. You should answer user inquiries based on the " +
    "context provided and history also avoid making up answers. If you don't know the answer, simply state that you don't " +
    "know and kindly ask if they have another question. Remember to provide relevant information about PrintAvenue's features, " +
    "benefits, and use cases to assist the user in understanding its value for designing unique print on demand product. " +
    "You're the only customer support team, do not refer to other customer support teams.",
  name: "Customer Support",
  slug: "customer-support",
};
const page = ({ params: { slug } }: PropType) => {
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatHidden, setChatHidden] = useState<boolean>(true);
  const [api, setApi] = useState<Api | null>(null);
  useEffect(() => {
    (async () => {
      if (api) {
        try {
          const data = await api.get_chatbot(slug);
          setChat(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [api]);
  return (
    <Layout page="chatbots" set_api={setApi}>
      <>
        {loading ? (
          <div className="w-full h-40 flex flex-1 justify-center items-center">
            <Spinner color="info" aria-label="Loading ..." size="xl" />
          </div>
        ) : chat ? (
          <div className="px-20 py-5 flex flex-col gap-y-5">
            <div className="flex flex-row justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold capitalize">
                  {chat.assistant_name}
                </h1>
                <span className="text-sm font-light text-gray-400">
                  Funny | Charming
                </span>
              </div>
              <Image
                src="/Xzh3R6N3.jpg"
                width={500}
                height={500}
                className="rounded-full h-32 w-32"
                alt="assistant image"
                quality={100}
              />
            </div>
            <div className="bg-white p-5 rounded-xl text-gray-400">
              <p>{chat.business_description}</p>
              <Button className="mt-4" onClick={() => setChatHidden(false)}>
                Start Chat
              </Button>
            </div>
            <div className="bg-white p-5 rounded-xl">
              <h1 className="my-3 text-lg font-medium">Resources</h1>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-x-4">
                  <p>Show</p>
                  <div className="bg-[#FFFFF0]">
                    <Dropdown label="10" inline>
                      <Dropdown.Item>20</Dropdown.Item>
                      <Dropdown.Item>30</Dropdown.Item>
                      <Dropdown.Item>40</Dropdown.Item>
                      <Dropdown.Item>50</Dropdown.Item>
                      <Dropdown.Item>100</Dropdown.Item>
                    </Dropdown>
                  </div>

                  <p>entries</p>
                  <TextInput
                    id="search"
                    type="text"
                    sizing="sm"
                    placeholder="Search"
                  />
                </div>
                <Button outline gradientDuoTone="greenToBlue">
                  <IoAdd />
                  <span className="ml-2">Add Resource</span>
                </Button>
              </div>
              <div>
                <Table className="my-5">
                  <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Document</Table.HeadCell>
                    <Table.HeadCell>Type</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    <Table.Row>
                      <Table.Cell>About</Table.Cell>
                      <Table.Cell className="whitespace-nowrap text-blue-600">
                        <a href="#">about_timestamp.pdf</a>
                      </Table.Cell>
                      <Table.Cell>PDF</Table.Cell>
                      <Table.Cell className="flex flex-row gap-x-3">
                        <Button color="success" size="xs">
                          <FaCloudUploadAlt />
                          <span className="ml-2">Upload</span>
                        </Button>
                        <Button color="failure" size="xs">
                          <FaTrash />
                          <span className="ml-2">Remove</span>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </div>
            </div>
            <ChatBox
              hidden={chatHidden}
              identifier={chat.identifier}
              set_chat_hidden={() => setChatHidden(true)}
            />
          </div>
        ) : (
          <></>
        )}
      </>
    </Layout>
  );
};

export default page;
