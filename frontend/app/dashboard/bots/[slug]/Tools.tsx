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
import React, { useCallback, useContext, useState } from "react";
import ResourceForm from "../../components/ResourceForm";
import { Context } from "./ChatDetailContext";
import { ResourceFormType, ResourceType, ToolType } from "@/app/types/types";
import Api from "@/app/components/Api";

const TOOLS = [
  {
    key: "rag",
    label: "RAG",
    description: "Retrieval-Augmented Generation",
    available: true,
    added: false,
  },
  {
    key: "aps",
    label: "Appointment Scheduler",
    description: "Manage your calendar integrations",
    available: false,
    added: false,
  },
  {
    key: "api",
    label: "API",
    description: "Make a call to an external API",
    available: false,
    added: false,
  },
];

type ParamType = {
  initialData: ResourceType[];
  tools: ToolType[];
};
function Tools({ initialData, tools: agent_tools }: ParamType) {
  let { api, identifier } = useContext(Context);

  const [resourceForm, setResourceForm] = useState<ResourceFormType>({
    name: "",
    document: "",
  });
  const [tools, setTools] = useState<ToolType[]>(agent_tools);
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

  const toolUsed = useCallback(
    (slug: string) => {
      return tools.findIndex((tool) => tool.slug == slug) != -1;
    },
    [tools]
  );

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
  const addTool = async (slug: string) => {
    if (api) {
      try {
        const newTool = TOOLS.find((tool) => tool.key == slug);
        if (!newTool) return;
        await api.add_tool(identifier, slug);
        setTools([...tools, { slug: slug, name: newTool.label }]);
      } catch (error) {
        console.error(error);
      }
    }
  };
  async function removeTool(slug: string): Promise<void> {
    if (api) {
      const newTools = tools.filter((tool) => tool.slug !== slug);
      setTools(newTools);
      try {
        await api.remove_tool(identifier, slug);
      } catch (error) {
        console.error(error);
      }
    }
  }

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
                    tool.available && !toolUsed(tool.key)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!tool.available || toolUsed(tool.key)}
                  onClick={() => addTool(tool.key)}
                >
                  {tool.available ? `+ Add ${tool.label}` : "Upcoming"}
                </button>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-4">Tools</h3>
          <div>
            {tools.map((tool) => (
              <Card className="w-full relative" key={tool.slug}>
                <CardHeader>
                  <div className="absolute top-8 right-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTool(tool.slug)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>
                    {resources.length} Resources
                  </CardDescription>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Document
                            </Button>
                          </DialogTrigger>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Dialog>
  );
}

export default Tools;
