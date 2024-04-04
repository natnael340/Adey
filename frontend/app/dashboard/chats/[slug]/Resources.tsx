"use client";

import { Button, Dropdown, Table, TextInput } from "flowbite-react";
import React, { useContext, useState } from "react";
import ResourceForm from "../../components/ResourceForm";
import { ResourceFormType, ResourceType } from "@/app/types/types";
import { Context } from "./ChatDetailContext";
import { IoAdd } from "react-icons/io5";
import { FaTrash, FaEdit } from "react-icons/fa";
import Api from "@/app/components/Api";

type ParamType = {
  initialData: ResourceType[];
};
const Resources = ({ initialData }: ParamType) => {
  let { api, identifier } = useContext(Context);

  const [resourceForm, setResourceForm] = useState<ResourceFormType>({
    name: "",
    document: "",
  });
  const [resources, setResources] = useState<ResourceType[]>(initialData);
  const [resourceEdit, setResourceEdit] = useState<string>("");
  const [resourceFormModal, setResourceFormModal] = useState(false);

  const fetchResources = async (_api: Api) => {
    try {
      const data = await _api.get_resources(identifier);
      console.log(data);
      setResources(data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const createResource = async (resource_slug: string) => {
    if (api) {
      try {
        if (resource_slug) {
          const data = await api.update_resource(
            identifier,
            resource_slug,
            resourceForm
          );
        } else {
          const data = await api.create_resource(identifier, resourceForm);
        }
        await fetchResources(api);
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
        const data = await api.remove_resource(identifier, resource_slug);
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
    <div className="bg-white p-5 rounded-xl">
      <ResourceForm
        updateForm={setResourceForm}
        form={resourceForm}
        openModal={resourceFormModal}
        setOpenModal={setResourceFormModal}
        saveChanges={(resource_slug) => createResource(resource_slug)}
        edit={resourceEdit}
      />
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
          <TextInput id="search" type="text" sizing="sm" placeholder="Search" />
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
                      popUpEditResourceForm(resource.slug, resource.name)
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
  );
};

export default Resources;
