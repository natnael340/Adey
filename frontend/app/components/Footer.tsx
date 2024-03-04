import {
  Footer as FBFooter,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import Image from "next/image";
import {
  BsDribbble,
  BsFacebook,
  BsGithub,
  BsInstagram,
  BsTwitter,
} from "react-icons/bs";
import { PiPhoneCallLight } from "react-icons/pi";
import { CiMail, CiLocationOn } from "react-icons/ci";

const Footer = () => {
  return (
    <div className="w-full bg-white py-5 space-y-20">
      <div className="flex flex-col items-center justify-center gap-y-5">
        <Image
          src="/adey_logo.png"
          width={50}
          height={50}
          className="w-12 h-12 my-2"
          alt="Adey Logo"
        />
        <div className="w-full md:w-1/2">
          <p className="text-sm text-[#9A9EA6] text-center">
            We ara a lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud equip ex ea commodo
            consequat...{" "}
            <a href="/" className="text-[#C3A811]">
              Read More
            </a>
          </p>
        </div>
        <div className="grid grid-cols-5 gap-x-3">
          <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
            <BsFacebook color="#C3A811" />
          </div>
          <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
            <BsInstagram color="#C3A811" />
          </div>
          <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
            <BsTwitter color="#C3A811" />
          </div>
          <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
            <BsGithub color="#C3A811" />
          </div>
          <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
            <BsDribbble color="#C3A811" />
          </div>
        </div>
        <div className="mt-10 flex items-center gap-x-20">
          <div className="flex items-center gap-x-3">
            <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
              <PiPhoneCallLight color="#C3A811" size={25} />
            </div>
            <div>
              <p className="text-[#797878] text-sm">Tel</p>
              <p className="text-[#C3A811] text-sm font-bold">+251114532515</p>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
              <CiMail color="#C3A811" size={25} />
            </div>
            <div>
              <p className="text-[#797878] text-sm">Mail</p>
              <p className="text-[#C3A811] text-sm font-bold">
                contact@adey.com
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
              <CiLocationOn color="#C3A811" size={25} />
            </div>
            <div>
              <p className="text-[#797878] text-sm">Address</p>
              <p className="text-[#C3A811] text-sm font-bold">
                Addis Ababa, Ethiopia
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5 px-20 w-full flex items-center justify-between text-[#797878]">
        <div className="flex items-center gap-x-2">
          <a href="#">About us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy policy</a>
          <a href="#">Sitemap</a>
          <a href="#">Term of use</a>
        </div>
        <p>© 2023-2024, All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
