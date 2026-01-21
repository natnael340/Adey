"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  FileText,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  Sparkles,
  Calendar,
  Zap,
  Check,
} from "lucide-react";
import React, { useCallback, useContext, useState } from "react";
import ResourceForm from "../../components/ResourceForm";
import { Context } from "./ChatDetailContext";
import { ResourceFormType, ResourceType, ToolType } from "@/app/types/types";
import Api from "@/app/components/Api";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    key: "rag",
    label: "RAG",
    description: "Retrieval-Augmented Generation for knowledge base queries",
    available: true,
    added: false,
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
  },
  {
    key: "aps",
    label: "Scheduler",
    description: "Manage appointments and calendar integrations",
    available: false,
    added: false,
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
  {
    key: "api",
    label: "API",
    description: "Connect to external APIs and services",
    available: false,
    added: false,
    icon: Zap,
    color: "bg-purple-100 text-purple-600",
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

  const fetchResources = async (_api: Api) => {
    try {
      const data = await _api.get_resources(identifier);
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
          await api.update_resource(identifier, resource_slug, resourceForm);
        } else {
          await api.create_resource(identifier, resourceForm);
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
        await api.remove_resource(identifier, resource_slug);
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

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Tools & Resources</h3>
          <p className="text-xs text-slate-500">
            Add capabilities to enhance your bot
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Available Tools */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-4">
            Available Tools
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOOLS.map((tool) => {
              const isUsed = toolUsed(tool.key);
              const Icon = tool.icon;
              return (
                <div
                  key={tool.key}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200",
                    isUsed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : tool.available
                        ? "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        : "border-slate-100 bg-slate-50/50 opacity-60"
                  )}
                >
                  {isUsed && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg mb-3",
                      tool.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h5 className="font-semibold text-slate-800 mb-1">
                    {tool.label}
                  </h5>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  <button
                    className={cn(
                      "w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      isUsed
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : tool.available
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                    disabled={!tool.available || isUsed}
                    onClick={() => addTool(tool.key)}
                  >
                    {isUsed ? "Added" : tool.available ? "Add Tool" : "Coming Soon"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Tools */}
        {tools.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">
              Active Tools
            </h4>
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.slug}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-800">
                          {tool.name}
                        </h5>
                        <p className="text-xs text-slate-500">
                          {resources.length} resources attached
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTool(tool.slug)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="resources" className="border-none">
                      <AccordionTrigger className="px-4 py-3 text-sm font-medium text-slate-600 hover:no-underline">
                        Resources
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2">
                          {resources.length === 0 ? (
                            <p className="text-sm text-slate-400 py-2">
                              No resources added yet
                            </p>
                          ) : (
                            resources.map((resource, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                              >
                                <a
                                  href={resource.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 truncate"
                                >
                                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {resource.name}
                                  </span>
                                </a>
                                <div className="flex items-center gap-1 shrink-0">
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                                      onClick={() =>
                                        popUpEditResourceForm(
                                          resource.slug,
                                          resource.name
                                        )
                                      }
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </DialogTrigger>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      removeResource(resource.slug)
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}

                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                            >
                              <Plus className="h-4 w-4 mr-1.5" />
                              Add Resource
                            </Button>
                          </DialogTrigger>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default Tools;
