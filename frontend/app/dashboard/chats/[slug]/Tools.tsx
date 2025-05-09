"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, FileText, Pen, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useContext, useState } from "react";
import ResourceForm from "../../components/ResourceForm";
import { Context } from "./ChatDetailContext";
import { ResourceFormType, ResourceType } from "@/app/types/types";
import Api from "@/app/components/Api";

const TOOLS = [
  {
    key: "3bb1fe19-03f1-4e27-aba2-665f90e22343",
    label: "RAG",
    description: "Retrieval-Augmented Generation",
    available: true,
  },
  {
    key: "ec3873f3-d9da-4438-b0d8-aa7baa9b0e9f",
    label: "Appointment Scheduler",
    description: "Manage your calendar integrations",
    available: false,
  },
  {
    key: "bcbdc1d9-a6d8-4c77-9d86-c9d6c926a9f6",
    label: "Retriever",
    description: "Corpus retrieval service",
    available: false,
  },
];

type ParamType = {
  initialData: ResourceType[];
};
function Tools({ initialData }: ParamType) {
  let { api, identifier } = useContext(Context);

  const [resourceForm, setResourceForm] = useState<ResourceFormType>({
    name: "",
    document: "",
  });
  const [resources, setResources] = useState<ResourceType[]>(initialData);
  const [resourceEdit, setResourceEdit] = useState<string>("");
  const [resourceFormModal, setResourceFormModal] = useState(false);
  const [resourcesLimit, setResourcesLimit] = useState(10);

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
  const onFormClose = (open: boolean) => {
    if (open) return;
    setResourceFormModal(false);
    setResourceEdit("");
    setResourceForm({
      name: "",
      document: "",
    });
  };
  return (
    <Dialog onOpenChange={onFormClose}>
      <ResourceForm
        updateForm={setResourceForm}
        form={resourceForm}
        openModal={resourceFormModal}
        setOpenModal={setResourceFormModal}
        saveChanges={(resource_slug) => createResource(resource_slug)}
        edit={resourceEdit}
      />
      <div className="space-y-8">
        <section className="space-y-5">
          <h3 className="text-lg font-semibold mb-4">Available Tools</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <div
                key={tool.key}
                className="p-4 border rounded-lg hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-semibold text-lg mb-2">{tool.label}</h4>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
                <button
                  className={`mt-4 px-4 py-2 rounded ${
                    tool.available
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!tool.available}
                >
                  {tool.available
                    ? `+ Add ${tool.label}`
                    : tool.available
                    ? `${tool.label} Added`
                    : "Upcoming"}
                </button>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-4">Tools</h3>
          <div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>RAG</CardTitle>
                <CardDescription>{resources.length} Resources</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="resources">
                    <AccordionTrigger>Resources</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {resources.map((resource, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <a
                              href={resource.document}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:underline truncate flex space-x-4"
                            >
                              <FileText className="h-4 w-4 mr-1 text-gray-400" />
                              {resource.name}
                            </a>
                            <div className="flex space-x-2">
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    popUpEditResourceForm(
                                      resource.slug,
                                      resource.name
                                    )
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeResource(resource.slug)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="h-4 w-4 mr-1" /> Add Document
                          </Button>
                        </DialogTrigger>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Dialog>
  );
}

export default Tools;
