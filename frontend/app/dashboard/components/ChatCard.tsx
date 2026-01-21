import React from "react";
import Image from "next/image";
import { FileText, MessageSquare, ArrowUpRight } from "lucide-react";

type PropTypes = {
  slug: string;
  name: string;
  characters: string[];
  description: string;
  resources: number;
  conversations: number;
  image: string;
};

const ChatCard = ({
  slug,
  name,
  characters,
  description,
  resources,
  conversations,
  image,
}: PropTypes) => {
  return (
    <a
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/60 p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
      href={`/dashboard/bots/${slug}`}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          <Image
            src={image}
            width={56}
            height={56}
            className="rounded-xl h-14 w-14 object-cover ring-2 ring-slate-100"
            alt={`${name} avatar`}
            quality={100}
          />
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <h2 className="text-base font-semibold text-slate-800 capitalize truncate">
            {name}
          </h2>
          {characters.length > 0 && (
            <p className="text-sm text-slate-500 capitalize truncate">
              {characters.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">{resources}</span>
          <span className="text-xs text-slate-400">resources</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">{conversations}</span>
          <span className="text-xs text-slate-400">chats</span>
        </div>
      </div>
    </a>
  );
};

export default ChatCard;
