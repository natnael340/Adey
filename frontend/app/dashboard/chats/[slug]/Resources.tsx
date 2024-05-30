"use client";

import React, { useContext, useState } from "react";
import ResourceForm from "../../components/ResourceForm";
import { ResourceFormType, ResourceType } from "@/app/types/types";
import { Context } from "./ChatDetailContext";
import Api from "@/app/components/Api";
import { Plus, Trash2, Settings2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  return (
    <Dialog>
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
              <DropdownMenu>
                <DropdownMenuTrigger>{resourcesLimit}</DropdownMenuTrigger>
                <DropdownMenuContent className="w-10">
                  <DropdownMenuRadioGroup
                    value={resourcesLimit.toString()}
                    onValueChange={(value: string) =>
                      setResourcesLimit(parseInt(value, 10))
                    }
                  >
                    <DropdownMenuRadioItem value="10">10</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="20">20</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="30">30</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="40">40</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="50">50</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="100">
                      100
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p>Entries</p>
            <Input id="search" type="text" placeholder="Search..." />
          </div>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setResourceFormModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
        </div>
        <div>
          <Table className="my-5">
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead>Name</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {resources.map((resource) => (
                <TableRow key={resource.slug}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-blue-600">
                    <a href={resource.document}>
                      {
                        resource.document.split("/")[
                          resource.document.split("/").length - 1
                        ]
                      }
                    </a>
                  </TableCell>
                  <TableCell>{resource.document_type}</TableCell>
                  <TableCell className="flex flex-row justify-end">
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          popUpEditResourceForm(resource.slug, resource.name)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <Button
                      variant="ghost"
                      onClick={() => removeResource(resource.slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Dialog>
  );
};

export default Resources;
