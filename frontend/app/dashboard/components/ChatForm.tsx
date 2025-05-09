"use client";

import { formUpdated } from "@/app/components/utils";
import { ChatFormType } from "@/app/types/types";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type PropTypes = {
  chatForm: ChatFormType;
  toggleFormOpen: () => void;
  CreateChatBot: (data: ChatFormType) => void;
  edit?: boolean;
};

const ChatFormSchema = z.object({
  botName: z.string().min(2, "Enter a name for your bot"),
  assistantName: z.string().min(2, "Enter the assistant's name"),
  characters: z.string().optional(),
  role: z.string().optional(),
  businessName: z.string().optional(),
  urls: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
});
type ChatFormValues = z.infer<typeof ChatFormSchema>;

const ChatForm = ({
  chatForm,
  CreateChatBot,
  edit,
  toggleFormOpen,
}: PropTypes) => {
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const [canSave, setCanSave] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<ChatFormValues>({
    resolver: zodResolver(ChatFormSchema),
    mode: "onChange",
  });

  const onSubmit = (data: ChatFormValues) => {
    CreateChatBot({
      name: data.botName,
      assistant_name: data.assistantName,
      assistant_role: data.role ?? "",
      assistant_characters: data.characters
        ? data.characters.split(",").map((char) => char.trim())
        : [],
      business_name: data.businessName ?? "",
      allowed_urls: data.urls
        ? data.urls.split(",").map((url) => url.trim())
        : [],
      business_description: data.description ?? "",
      assistant_picture_data: data.avatar ?? "",
    });
  };

  return (
    <DialogContent className="max-w-xl p-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <DialogHeader className="bg-[#FEF8D6] text-black p-6">
          <h2 className="text-2xl font-semibold">
            {edit ? "Update" : "Create"} Your Chat Bot
          </h2>
          <p className="mt-1 text-sm opacity-80">
            Configure persona and business details
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5 bg-white"
        >
          <div className="flex items-center space-x-4">
            <Controller
              name="avatar"
              control={control}
              defaultValue={chatForm.assistant_picture_data ?? ""}
              render={({ field }) => (
                <Avatar
                  className="w-20 h-20 cursor-pointer"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {field.value ? (
                    <AvatarImage src={field.value} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="flex items-center justify-center bg-[#FFFBEB] text-[#B89F5A]">
                      <Camera size={24} />
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            />
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setValue("avatar", reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
            <div className="flex-1">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                defaultValue={chatForm.name ?? ""}
                {...register("botName")}
                className="focus:border-[#F9E8A0]"
              />
              {errors.botName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.botName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assistantName">Assistant Name</Label>
              <Input
                id="assistantName"
                defaultValue={chatForm.assistant_name ?? ""}
                {...register("assistantName")}
                className="focus:border-[#F9E8A0]"
              />
              {errors.assistantName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assistantName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                defaultValue={chatForm.assistant_role ?? ""}
                {...register("role")}
                className="focus:border-[#F9E8A0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="characters">Character Traits</Label>
              <Input
                id="characters"
                defaultValue={chatForm.assistant_characters?.join(", ") ?? ""}
                placeholder="e.g. friendly, witty"
                {...register("characters")}
                className="focus:border-[#F9E8A0]"
              />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                defaultValue={chatForm.business_name ?? ""}
                {...register("businessName")}
                className="focus:border-[#F9E8A0]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="urls">Allowed URLs</Label>
            <Input
              id="urls"
              defaultValue={chatForm.allowed_urls?.join(", ") ?? ""}
              placeholder="Comma-separated links"
              {...register("urls")}
              className="focus:border-[#F9E8A0]"
            />
          </div>

          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              defaultValue={chatForm.business_description ?? ""}
              rows={4}
              {...register("description")}
              className="focus:border-[#F9E8A0]"
            />
          </div>

          <DialogFooter className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={toggleFormOpen}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-[#F9E8A0] hover:bg-[#FEF8D6] text-black disabled:opacity-50"
            >
              {edit ? "Update" : "Create"} Bot
            </Button>
          </DialogFooter>
        </form>
      </motion.div>

      {/* <div className="flex flex-row items-center space-x-5">
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
      </DialogFooter> */}
    </DialogContent>
  );
};

export default ChatForm;
