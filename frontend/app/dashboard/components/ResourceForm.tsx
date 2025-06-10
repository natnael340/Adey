"use client";

import { ResourceFormType } from "@/app/types/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [inputType, setInputType] = useState<"document" | "url">("document");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (
      (edit && form.name) ||
      (form.name && form.document) ||
      (form.name && url)
    ) {
      setCanSave(true);
    } else {
      setCanSave(false);
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

  const handleInputTypeChange = (value: "document" | "url") => {
    setInputType(value);
    // Clear the current document when switching input types
    updateForm({ ...form, document: "" });
    if (value === "document") {
      setUrl("");
    }
  };
  const extractTextFromUrl = async (url: string): Promise<string> => {
    try {
      // Fetch the webpage content
      const response = await fetch(url);
      const html = await response.text();

      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Remove script and style elements
      const scripts = doc.querySelectorAll("script, style");
      scripts.forEach((script) => script.remove());

      // Extract text content
      const textContent = doc.body.textContent || doc.body.innerText || "";

      // Clean up whitespace
      return textContent.replace(/\s+/g, " ").trim();
    } catch (error) {
      console.error("Error extracting text from URL:", error);
      throw new Error("Failed to extract content from URL");
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;

    try {
      const extractedText = await extractTextFromUrl(url);

      // Create a File-like object from the extracted text
      const textBlob = new Blob([extractedText], { type: "text/plain" });
      const textFile = new File([textBlob], `${form.name || "webpage"}.txt`, {
        type: "text/plain",
      });

      updateForm({ ...form, document: textFile });
    } catch (error) {
      console.error(
        "Failed to extract content from URL. Please check the URL and try again."
      );
    }
  };

  const handleSave = () => {
    if (inputType === "url" && url) {
      handleUrlSubmit().then(() => saveChanges(edit));
    } else saveChanges(edit);
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
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label>Source Type</Label>
        <RadioGroup
          value={inputType}
          onValueChange={(value: "document" | "url") =>
            handleInputTypeChange(value)
          }
          className="flex flex-row gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="document" id="document" />
            <Label htmlFor="document">Upload Document</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url" />
            <Label htmlFor="url">From URL</Label>
          </div>
        </RadioGroup>
      </div>
      {inputType == "document" ? (
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
      ) : (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="resource_url">File</Label>
          <Input
            type="url"
            id="resource_url"
            placeholder="https://example.com/faq"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button disabled={!canSave} onClick={handleSave}>
            {edit ? "Update" : "Create"} resource
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default ResourceForm;
