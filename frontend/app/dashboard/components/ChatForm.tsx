"use client";

import { ChatFormType } from "@/app/types/types";
import { motion } from "framer-motion";
import React from "react";
import { X, Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
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
    </DialogContent>
  );
};

export default ChatForm;
