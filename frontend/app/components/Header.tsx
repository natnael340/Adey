import Image from "next/image";
import React from "react";
import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
} from "flowbite-react";
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
    <Navbar rounded className="bg-[rgba(255,255,0,0.06)]">
      <NavbarBrand as={Link} href="/">
        <Image
          className="w-6 h-6 sm:h-9 sm:w-9 mr-3"
          src="/adey_logo.png"
          alt="logo"
          width={75}
          height={75}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-black">
          Adey
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink as={Link} href="#" active={activeList["home"]}>
          Home
        </NavbarLink>
        {session ? (
          <NavbarLink as={Link} href="/dashboard">
            Dashboard
          </NavbarLink>
        ) : (
          <></>
        )}
        <NavbarLink as={Link} href="#" active={activeList["about"]}>
          About
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
