"use client";

import { formUpdated } from "@/app/components/utils";
import { ChatFormType } from "@/app/types/types";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PropTypes = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  chatForm: ChatFormType;
  _chatForm: ChatFormType;
  setChatForm: (value: ChatFormType) => void;
  CreateChatBot: () => void;
  edit?: boolean;
};
const ChatForm = ({
  openModal,
  chatForm,
  _chatForm,
  setOpenModal,
  setChatForm,
  CreateChatBot,
  edit,
}: PropTypes) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canSave, setCanSave] = useState(false);

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setChatForm({
          ...chatForm,
          assistant_picture_data: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const { status, data } = formUpdated(chatForm, _chatForm);

    if (status !== canSave) setCanSave(status);
  }, [chatForm]);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{edit ? "Edit" : "Add"} Chat bot</DialogTitle>
      </DialogHeader>

      <div className="flex flex-row items-center space-x-5">
        {chatForm.assistant_picture_data ? (
          <div className="relative">
            <Image
              src={{
                src: chatForm.assistant_picture_data,
                width: 100,
                height: 100,
              }}
              alt="Assistant picture"
              className="w-32 h-32 rounded-full"
            />
            {edit ? (
              <div className="absolute top-0 left-0 bottom-0 right-0 rounded-full hover:bg-black hover:bg-opacity-20 z-10 flex items-center justify-center">
                <button
                  className="flex z-20 w-32 h-32 rounded-full items-center justify-center focus:border-transparent border-transparent outline-none outline-transparent opacity-0 hover:opacity-100"
                  onClick={handleImageUploadClick}
                >
                  <Camera size={28} color="#D9D9D9" />
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <button
            className="w-32 h-32 rounded-full bg-[#D9D9D9] flex items-center justify-center focus:border-transparent border-transparent outline-none outline-transparent"
            onClick={handleImageUploadClick}
          >
            <Camera size={28} color="#818181" />
          </button>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="grid w-full items-center gap-1.5 flex-1">
          <Label htmlFor="bot_name">Bot Name</Label>
          <Input
            type="text"
            id="bot_name"
            placeholder="Customer support"
            className="w-full"
            onChange={(e) => setChatForm({ ...chatForm, name: e.target.value })}
            value={chatForm.name}
          />
        </div>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="assistant_name">Name</Label>
        <Input
          type="text"
          id="assistant_name"
          placeholder="Selam"
          className="w-full"
          onChange={(e) =>
            setChatForm({ ...chatForm, assistant_name: e.target.value })
          }
          value={chatForm.assistant_name}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="assistant_character">Character</Label>
        <Input
          type="text"
          id="assistant_character"
          placeholder="funny,charming"
          className="w-full"
          onChange={(e) =>
            setChatForm({
              ...chatForm,
              assistant_characters: e.target.value.split(","),
            })
          }
          value={chatForm.assistant_characters.join(",")}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="assistant_role">Assistant Role</Label>
        <Input
          type="text"
          id="assistant_role"
          placeholder="Manager"
          className="w-full"
          onChange={(e) =>
            setChatForm({ ...chatForm, assistant_role: e.target.value })
          }
          value={chatForm.assistant_role}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          type="text"
          id="business_name"
          placeholder="Print Avenue"
          className="w-full"
          onChange={(e) =>
            setChatForm({ ...chatForm, business_name: e.target.value })
          }
          value={chatForm.business_name}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="assistant_urls">Allowed URLS</Label>
        <Input
          type="text"
          id="assistant_urls"
          placeholder="https://www.example.com/,https://app.example.com/app"
          className="w-full"
          onChange={(e) =>
            setChatForm({
              ...chatForm,
              allowed_urls: e.target.value.split(","),
            })
          }
          value={chatForm.allowed_urls.join(",")}
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="business_description">Business Description</Label>
        <Input
          type="text"
          id="business_description"
          placeholder="About your business..."
          className="w-full"
          onChange={(e) =>
            setChatForm({ ...chatForm, business_description: e.target.value })
          }
          value={chatForm.business_description}
        />
      </div>
      <DialogFooter>
        <Button disabled={!canSave} onClick={CreateChatBot}>
          {edit ? "Update" : "Create"} Chat Bot
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ChatForm;
