"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../_layout";
import {
  ChatDetailType,
  ChatFormType,
  ChatType,
  ResourceFormType,
  ResourceType,
} from "@/app/types/types";
import Api from "@/app/components/Api";
import { Button, Dropdown, Spinner, Table, TextInput } from "flowbite-react";
import Image from "next/image";
import { IoAdd } from "react-icons/io5";
import { FaCloudUploadAlt, FaTrash, FaEdit } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";
import ChatForm from "../../components/ChatForm";
import ResourceForm from "../../components/ResourceForm";

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
  const [resourceForm, setResourceForm] = useState<ResourceFormType>({
    name: "",
    document: "",
  });
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [resourceEdit, setResourceEdit] = useState<string>("");
  const [resourceFormModal, setResourceFormModal] = useState(false);
  const [chatForm, setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
  });
  const [_chatForm, _setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [chatHidden, setChatHidden] = useState<boolean>(true);
  const [api, setApi] = useState<Api | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const fetchChatBot = async (_api: Api) => {
    try {
      const data = await _api.get_chatbot(slug);
      setChat(data);
      const form = {
        assistant_name: data.assistant_name,
        assistant_characters: data.assistant_characters.map(
          (character) => character.name
        ),
        assistant_picture_data: data.assistant_picture_url,
        assistant_role: data.assistant_role,
        business_description: data.business_description,
        business_name: data.business_name,
        name: data.name,
      };
      setChatForm(form);
      _setChatForm(form);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchResources = async (_api: Api) => {
    try {
      const data = await _api.get_resources(slug);
      console.log(data);
      setResources(data.results);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (api) {
      fetchChatBot(api);
      fetchResources(api);
    }
  }, [api]);
  const UpdateChatForm = async () => {
    if (api) {
      try {
        const data = await api.update_chatbot(slug, chatForm, _chatForm);
        await fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const createResource = async (resource_slug: string) => {
    if (api) {
      try {
        if (resource_slug) {
          const data = await api.update_resource(
            slug,
            resource_slug,
            resourceForm
          );
        } else {
          const data = await api.create_resource(slug, resourceForm);
        }
        await fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const removeResource = async (resource_slug: string) => {
    if (api) {
      try {
        const res = resources.filter((res) => res.slug !== resource_slug);
        setResources(res);
        const data = api.remove_resource(slug, resource_slug);
        fetchResources(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const popUpEditResourceForm = (resource_slug: string, name: string) => {
    setResourceFormModal(true);
    setResourceEdit(resource_slug);
    setResourceForm({ ...resourceForm, name: name });
  };
  return (
    <Layout page="chatbots" set_api={setApi}>
      <>
        {loading ? (
          <div className="w-full h-40 flex flex-1 justify-center items-center">
            <Spinner color="info" aria-label="Loading ..." size="xl" />
          </div>
        ) : chat ? (
          <div className="px-20 py-5 flex flex-col gap-y-5">
            <ChatForm
              CreateChatBot={UpdateChatForm}
              chatForm={chatForm}
              _chatForm={_chatForm}
              openModal={openModal}
              setChatForm={setChatForm}
              setOpenModal={setOpenModal}
              edit={true}
            />
            <ResourceForm
              updateForm={setResourceForm}
              form={resourceForm}
              openModal={resourceFormModal}
              setOpenModal={setResourceFormModal}
              saveChanges={(resource_slug) => createResource(resource_slug)}
              edit={resourceEdit}
            />
            <div className="flex flex-row justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold capitalize">
                  {chat.assistant_name}
                </h1>
                <span className="text-sm font-light text-gray-400 capitalize">
                  {chat.assistant_characters
                    .map((character) => character.name)
                    .join(" | ")}
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
              <div className="flex flex-row gap-x-5">
                <Button className="mt-4" onClick={() => setChatHidden(false)}>
                  Start Chat
                </Button>
                <Button
                  className="mt-4"
                  color="warning"
                  onClick={() => setOpenModal(true)}
                >
                  Edit Chat Bot
                </Button>
              </div>
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
                <Button
                  outline
                  gradientDuoTone="greenToBlue"
                  onClick={() => setResourceFormModal(true)}
                >
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
                    {resources.map((resource) => (
                      <Table.Row key={resource.slug}>
                        <Table.Cell>{resource.name}</Table.Cell>
                        <Table.Cell className="whitespace-nowrap text-blue-600">
                          <a href={resource.document}>
                            {
                              resource.document.split("/")[
                                resource.document.split("/").length - 1
                              ]
                            }
                          </a>
                        </Table.Cell>
                        <Table.Cell>{resource.document_type}</Table.Cell>
                        <Table.Cell className="flex flex-row gap-x-3">
                          <Button
                            color="success"
                            size="xs"
                            onClick={() =>
                              popUpEditResourceForm(
                                resource.slug,
                                resource.name
                              )
                            }
                          >
                            <FaEdit />
                            <span className="ml-2">Edit</span>
                          </Button>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => removeResource(resource.slug)}
                          >
                            <FaTrash />
                            <span className="ml-2">Remove</span>
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
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
