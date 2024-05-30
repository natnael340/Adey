"use client";

import { ResourceFormType } from "@/app/types/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PropTypes = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  form: ResourceFormType;
  updateForm: (value: ResourceFormType) => void;
  saveChanges: (value: string) => void;
  edit: string;
};
const ResourceForm = ({
  openModal,
  setOpenModal,
  form,
  updateForm,
  saveChanges,
  edit,
}: PropTypes) => {
  const [canSave, setCanSave] = useState(false);
  useEffect(() => {
    if (edit && form.name) {
      setCanSave(true);
    } else if (form.document && form.name) {
      setCanSave(true);
    }
  }, [form]);
  // @ts-ignore
  const onFormClose = () => {
    updateForm({
      name: "",
      document: "",
    });
    setOpenModal(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      updateForm({ ...form, document: e.target.files[0] });
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{edit ? "Edit" : "Add"} Resource</DialogTitle>
      </DialogHeader>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="resource_name">Name</Label>
        <Input
          type="text"
          id="resource_name"
          placeholder="About XYZ LLC."
          className="w-full"
          value={form.name}
          onChange={(e) => updateForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="resource_file">File</Label>
        <Input
          type="file"
          id="resource_file"
          accept=".pdf,.txt"
          onChange={(e) => handleFileUpload(e)}
          className="w-full"
        />
      </div>
      <DialogFooter>
        <Button disabled={!canSave} onClick={() => saveChanges(edit)}>
          {edit ? "Update" : "Create"} resource
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ResourceForm;
