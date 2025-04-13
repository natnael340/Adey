import Image from "next/image";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

type PropType = {
  activeList: {
    home?: boolean;
    about?: boolean;
  };
  set_session?: (session: any) => void;
};

const Header = async ({ activeList, set_session }: PropType) => {
  const session = await getServerSession(authOptions);
  if (set_session && session) {
    set_session(session);
  }
  return (
    <div className="flex flex-row w-full items-center">
      <a
        role="button"
        href="/"
        className="flex flex-row items-center space-x-2"
      >
        <Image
          className="w-6 h-6 sm:h-9 sm:w-9"
          src="/adey_logo.png"
          alt="logo"
          width={75}
          height={75}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-[#15192C]">
          Adey
        </span>
      </a>
      <div className="flex-1 flex flex-row items-center justify-center gap-10">
        <a
          role="button"
          href="/"
          className={`text-lg ${
            activeList["home"] ? "text-[#15192C] font-bold" : "text-[#45464B]"
          }`}
        >
          Home
        </a>
        {session ? (
          <a role="button" href="/dashboard" className="text-lg text-[#45464B]">
            Dashboard
          </a>
        ) : (
          <></>
        )}
        {/* <a
          role="button"
          href="/about"
          className={`text-lg  ${
            activeList["about"] ? "text-[#15192C] font-bold" : "text-[#45464B]"
          }`}
        >
          About
        </a> */}
      </div>
    </div>
  );
};

export default Header;
