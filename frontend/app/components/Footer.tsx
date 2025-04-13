import Image from "next/image";
import {
  Facebook,
  Dribbble,
  Github,
  Instagram,
  Twitter,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";

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
            Helping small businesses automate customer support with AI-powered chatbots — no overhead, no hassle.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-3">
          <a className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center" href="https://www.facebook.com/profile.php?id=61574953423477">
            <Facebook color="#C3A811" size={18} />
          </a>
          <a className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center" href="https://github.com/natnael340/Adey">
            <Github color="#C3A811" size={18} />
          </a>
        </div>
        <div className="mt-10 flex items-center gap-x-20">
          <div className="flex items-center gap-x-3">
            <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
              <Mail color="#C3A811" size={22} />
            </div>
            <div>
              <p className="text-[#797878] text-sm">Mail</p>
              <p className="text-[#C3A811] text-sm font-bold">
                contact@adey-chatbot.website
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
              <MapPin color="#C3A811" size={22} />
            </div>
            <div>
              <p className="text-[#797878] text-sm">Address</p>
              <p className="text-[#C3A811] text-sm font-bold">
                Warsaw, Poland
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5 px-20 w-full flex items-center justify-between text-[#797878]">
        <div className="flex items-center gap-x-2">
        </div>
        <p>© 2025 Adey — AI Smart Chatbots for Small Business Success</p>
      </div>
    </div>
  );
};

export default Footer;
