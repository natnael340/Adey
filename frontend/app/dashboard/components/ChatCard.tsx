import React from "react";
import Image from "next/image";

type PropTypes = {
  name: string;
  characters: string[];
  description: string;
  resources: number;
  conversations: number;
  image: string;
};
const ChatCard = ({
  name,
  characters,
  description,
  resources,
  conversations,
  image,
}: PropTypes) => {
  return (
    <a
      className="rounded-lg shadow-lg flex flex-row gap-x-2 w-[500px] cursor-pointer"
      href="#"
    >
      <div className="pl-5 py-5">
        <h1 className="text-lg font-bold">{name}</h1>
        <span className="text-sm text-gray-400 capitalize">
          {characters.join(" | ")}
        </span>
        <p className="text-sm text-gray-400 leading-none my-2">{description}</p>
        <div className="flex flex-row gap-x-2 mt-5">
          <div className="flex rounded-full flex-row gap-x-2 items-center bg-[#EDD447]">
            <p className="pl-3 text-sm">Resources</p>
            <div className="rounded-full text-sm w-7 h-7 flex items-center justify-center text-white bg-[#C3A811]">
              {resources}
            </div>
          </div>
          <div className="flex rounded-full flex-row gap-x-2 items-center bg-[#EDD447]">
            <p className="pl-3 text-sm">Conversations</p>
            <div className="rounded-full text-sm w-7 h-7 flex items-center justify-center text-white bg-[#C3A811]">
              {conversations}
            </div>
          </div>
        </div>
      </div>
      <Image
        src={image}
        width={500}
        height={500}
        className="rounded-r-lg h-48 w-40"
        alt="assistant image"
        quality={100}
      />
    </a>
  );
};

export default ChatCard;
