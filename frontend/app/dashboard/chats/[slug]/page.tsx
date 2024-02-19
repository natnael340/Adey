"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../_layout2";
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
import { FaTrash, FaEdit } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";
import ChatForm from "../../components/ChatForm";
import ResourceForm from "../../components/ResourceForm";
import Code from "../../components/Code";

type PropType = {
  params: {
    slug: string;
  };
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
    allowed_urls: [],
  });
  const [_chatForm, _setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
    allowed_urls: [],
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
        allowed_urls: data.allowed_urls,
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
        const data = await api.remove_resource(slug, resource_slug);
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
  const buildChatBot = async () => {
    if (api) {
      try {
        await api.build_chatbot(slug);
        fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
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
              {chat.assistant_picture_url ? (
                <Image
                  src={chat.assistant_picture_url}
                  width={500}
                  height={500}
                  className="rounded-full h-32 w-32"
                  alt="assistant image"
                  quality={100}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-slate-300" />
              )}
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
                {chat.status != "finished" ? (
                  <Button className="mt-4" onClick={() => buildChatBot()}>
                    {chat.status == "prepared" ? "Build" : "Rebuild"}
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl text-gray-900 space-y-3">
              <h3 className="font-bold text-xl mb-3">
                Integration Guide: Chatbot Integration
              </h3>
              <p>
                To integrate our chatbot into your website or web application,
                please follow the steps below:
              </p>
              <h5 className="font-semibold text-lg">
                Step 1: Add Your Chat Identifier
              </h5>
              <p>
                In the &lt;head&gt; section of your HTML page, add the following
                meta tag to specify the chat identifier:
              </p>
              <Code
                code={`<meta name="adey_chat_id" content="${chat.identifier}" />`}
              />
              <h5 className="font-semibold text-lg">
                Step 2: Add CSS for Widget
              </h5>
              <p>
                To style the chatbot widget, add the following CSS link tag in
                the &lt;head&gt; section of your HTML page:
              </p>
              <Code
                code={`<link rel="stylesheet" crossorigin href="http://192.168.51.172:8000/media/chatbot/index.css" />`}
              />
              <p>
                This link tag will load the CSS file required for the chatbot
                widget. Ensure that the href attribute points to the correct
                location of the CSS file.
              </p>
              <h5 className="font-semibold text-lg">
                Step 3: Add Script for Widget
              </h5>
              <p>
                At the end of your HTML page, just before the closing
                &lt;/body&gt;tag, add the following script tag to load the
                chatbot script:
              </p>
              <Code
                code={`<script type="module" crossorigin src="http://192.168.51.172:8000/media/chatbot/index.js"></script>`}
              />
              <p>
                This script tag will load the JavaScript code responsible for
                initializing and displaying the chatbot. Make sure that the src
                attribute points to the correct location of the JavaScript file.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl">
              <h1 className="my-3 text-lg font-medium">Allowed urls</h1>
              <div>
                <Table className="my-5">
                  <Table.Head>
                    <Table.HeadCell>URL</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {chat.allowed_urls.map((url, idx) => (
                      <Table.Row key={idx}>
                        <Table.Cell>{url}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
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
            {chat.identifier ? <ChatBox chat_id={chat.identifier} /> : <></>}
          </div>
        ) : (
          <></>
        )}
      </>
    </Layout>
  );
};

export default page;
