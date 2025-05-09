import Image from "next/image";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

type PropType = {
  activeList: {
    home?: boolean;
    about?: boolean;
    features?: boolean;
  };
  set_session?: (session: any) => void;
  absolute?: boolean;
};

const Header = async ({
  activeList,
  set_session,
  absolute = false,
}: PropType) => {
  const session = await getServerSession(authOptions);
  if (set_session && session) {
    set_session(session);
  }
  return (
    <div
      className={`flex flex-row w-screen items-center justify-between px-16 py-5 ${
        absolute ? "absolute z-50 bg-transparent" : "bg-white shadow-lg"
      }`}
    >
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
      <div className="flex flex-row items-center justify-center gap-10">
        <a
          role="button"
          href="/"
          className={`text-lg relative ${
            activeList.home ? "text-[#15192C]" : "text-[#45464B]"
          }`}
        >
          Home
          {activeList.home && (
            <div className="absolute w-10 bg-[#15192C] h-[0.5px] -bottom-1 left-1/2 -translate-x-1/2"></div>
          )}
        </a>
        <a
          role="button"
          href="/features"
          className={`text-lg relative ${
            activeList.features ? "text-[#15192C]" : "text-[#45464B]"
          }`}
        >
          Features
          {activeList.features && (
            <div className="absolute w-10 bg-[#15192C] h-[0.5px] -bottom-1 left-1/2 -translate-x-1/2"></div>
          )}
        </a>
        {session ? (
          <a role="button" href="/dashboard" className="text-lg text-[#45464B]">
            Dashboard
          </a>
        ) : (
          <a
            role="button"
            href="/auth/login"
            className="text-lg text-[#15192C]"
          >
            Sign In
          </a>
        )}
      </div>
    </div>
  );
};

export default Header;
