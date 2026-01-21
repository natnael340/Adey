"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "./ChatDetailContext";
import { ChatFormType, ChatDetailType } from "@/app/types/types";
import ChatForm from "../../components/ChatForm";
import Api from "@/app/components/Api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Cog,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

const ChatDetail = () => {
  let { api, bot, identifier, setBot, toggleFormOpen } = useContext(Context);
  const [chatForm, setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
    allowed_urls: [],
  });
  const [_chatForm, _setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
    allowed_urls: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);

  const initiateChatBotForm = (data: ChatDetailType) => {
    const form = {
      assistant_name: data.assistant_name,
      assistant_characters: data.assistant_characters.map(
        (character) => character.name
      ),
      assistant_picture_data: data.assistant_picture_url,
      assistant_role: data.assistant_role,
      business_description: data.business_description,
      business_name: data.business_name,
      name: data.name,
      allowed_urls: data.allowed_urls,
    };
    setChatForm(form);
    _setChatForm(form);
  };

  const fetchChatBot = async (_api: Api) => {
    try {
      const data = await _api.get_chatbot(identifier);
      setBot(data);
      const form = {
        assistant_name: data.assistant_name,
        assistant_characters: data.assistant_characters.map(
          (character) => character.name
        ),
        assistant_picture_data: data.assistant_picture_url,
        assistant_role: data.assistant_role,
        business_description: data.business_description,
        business_name: data.business_name,
        name: data.name,
        allowed_urls: data.allowed_urls,
      };
      setChatForm(form);
      _setChatForm(form);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const UpdateChatForm = async (data: ChatFormType) => {
    if (api) {
      try {
        await api.update_chatbot(identifier, data, chatForm);
        await fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const buildChatBot = async () => {
    if (api) {
      setIsBuilding(true);
      try {
        await api.build_chatbot(identifier);
        fetchChatBot(api);
      } catch (error) {
        console.error(error);
      } finally {
        setIsBuilding(false);
      }
    }
  };

  useEffect(() => {
    initiateChatBotForm(bot);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "finished":
        return {
          label: "Active",
          icon: CheckCircle2,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dotClassName: "bg-emerald-500",
        };
      case "prepared":
        return {
          label: "Ready to build",
          icon: Clock,
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dotClassName: "bg-amber-500",
        };
      default:
        return {
          label: "Needs rebuild",
          icon: AlertCircle,
          className: "bg-slate-50 text-slate-700 border-slate-200",
          dotClassName: "bg-slate-500",
        };
    }
  };

  const statusConfig = getStatusConfig(bot.status);
  const StatusIcon = statusConfig.icon;

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <ChatForm
        CreateChatBot={async (data) => {
          await UpdateChatForm(data);
          handleCloseModal();
        }}
        chatForm={chatForm}
        toggleFormOpen={handleCloseModal}
        edit={true}
      />

      {/* Back navigation */}
      <Link
        href="/dashboard/bots"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bots
      </Link>

      {/* Main bot card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        {/* Header section */}
        <div className="p-6 pb-0">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {bot.assistant_picture_url ? (
                <Image
                  src={bot.assistant_picture_url}
                  width={96}
                  height={96}
                  className="rounded-2xl h-24 w-24 object-cover ring-4 ring-slate-100"
                  alt={`${bot.assistant_name} avatar`}
                  quality={100}
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-slate-400">
                    {bot.assistant_name?.charAt(0)?.toUpperCase() || "B"}
                  </span>
                </div>
              )}
              <div
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${statusConfig.dotClassName}`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-800 capitalize">
                    {bot.assistant_name}
                  </h1>
                  {bot.assistant_role && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      {bot.assistant_role}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Character traits */}
              {bot.assistant_characters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {bot.assistant_characters.map((character, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 capitalize"
                    >
                      {character.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {bot.business_description && (
          <div className="px-6 py-4 mt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">
              {bot.business_description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setOpenModal(true)}
              className="h-9 px-4 text-sm"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Edit Bot
            </Button>
          </DialogTrigger>

          {bot.status !== "finished" && (
            <Button
              onClick={() => buildChatBot()}
              disabled={isBuilding}
              className="h-9 px-4 text-sm bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Cog
                className={`mr-2 h-4 w-4 ${isBuilding ? "animate-spin" : ""}`}
              />
              {isBuilding
                ? "Building..."
                : bot.status === "prepared"
                  ? "Build Bot"
                  : "Rebuild Bot"}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ChatDetail;
