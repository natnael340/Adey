import React from "react";
import Image from "next/image";

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
      className="shadow-xl flex flex-row gap-x-2 cursor-pointer bg-white rounded-xl p-5 min-w-72"
      href={`chats/${slug}`}
    >
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center space-x-2 mb-4">
            <div>
              <Image
                src={image}
                width={100}
                height={100}
                className="rounded-full h-14 w-14"
                alt="assistant image"
                quality={100}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold capitalize">{name}</h1>
              <span className="text-sm text-gray-400 capitalize">
                {characters.join(" | ")}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-none my-2 text-ellipsis line-clamp-3">
            {description}
          </p>
        </div>
        <div className="flex flex-row gap-x-2 mt-5">
          <div className="flex rounded-full flex-row gap-x-2 items-center bg-[#EDD447]">
            <p className="pl-3 text-sm text-[#59595B]">Resources</p>
            <div className="rounded-full text-sm w-7 h-7 flex items-center justify-center text-white bg-[#C3A811]">
              {resources}
            </div>
          </div>
          <div className="flex rounded-full flex-row gap-x-2 items-center bg-[#EDD447]">
            <p className="pl-3 text-sm text-[#59595B]">Conversations</p>
            <div className="rounded-full text-sm w-7 h-7 flex items-center justify-center text-white bg-[#C3A811]">
              {conversations}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ChatCard;
