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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-[#E0C06F] text-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and description */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 ">
            {/* Sample logo icon */}
            <Image
              src="/adey_logo.png"
              width={32}
              height={32}
              className="w-8 h-8"
              alt="Adey Logo"
            />
            <h2 className="text-2xl font-bold">Adey</h2>
          </div>
          <p className="text-sm">
            Building delightful chat experiences with AI-driven bots and
            powerful tools.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-700"
            >
              <svg viewBox="0 0 128 128">
                <path
                  d="M75.916 54.2 122.542 0h-11.05L71.008 47.06 38.672 0H1.376l48.898 71.164L1.376 128h11.05L55.18 78.303 89.328 128h37.296L75.913 54.2ZM60.782 71.79l-4.955-7.086-39.42-56.386h16.972L65.19 53.824l4.954 7.086 41.353 59.15h-16.97L60.782 71.793Z"
                  fill="#000"
                  style={{ strokeWidth: 0.104373 }}
                ></path>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-700"
            >
              <svg viewBox="0 0 128 128">
                <g fill="#181616">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z"
                  ></path>
                  <path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zM31.312 98.012c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0"></path>
                </g>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-700"
            >
              <Mail />
            </Button>
          </div>
        </div>

        {/* Navigation links */}
        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/features" className="hover:text-gray-700">
                Features
              </a>
            </li>
            <li>
              <a href="/pricing" className="hover:text-gray-700">
                Pricing
              </a>
            </li>
            <li>
              <a href="/docs" className="hover:text-gray-700">
                Documentation
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-gray-700">
                Blog
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/about" className="hover:text-gray-700">
                About Us
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-gray-700">
                Careers
              </a>
            </li>
            <li>
              <a href="/support" className="hover:text-gray-700">
                Support
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-700">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter signup */}
        <div>
          <h3 className="font-semibold mb-4">Stay updated</h3>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Subscribe to our newsletter
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                className="flex-1"
              />
              <Button className="whitespace-nowrap">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8 border-[#F2DA85]" />

      <div className="max-w-6xl mx-auto px-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Adey. All rights reserved.
      </div>
    </footer>
  );
  // return (
  //   <div className="w-full bg-white py-5 space-y-20">
  //     <div className="flex flex-col items-center justify-center gap-y-5">
  //       <Image
  //         src="/adey_logo.png"
  //         width={50}
  //         height={50}
  //         className="w-12 h-12 my-2"
  //         alt="Adey Logo"
  //       />
  //       <div className="w-full md:w-1/2">
  //         <p className="text-sm text-[#9A9EA6] text-center">
  //           Helping small businesses automate customer support with AI-powered chatbots — no overhead, no hassle.
  //         </p>
  //       </div>
  //       <div className="grid grid-cols-2 gap-x-3">
  //         <a className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center" href="https://www.facebook.com/profile.php?id=61574953423477">
  //           <Facebook color="#C3A811" size={18} />
  //         </a>
  //         <a className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center" href="https://github.com/natnael340/Adey">
  //           <Github color="#C3A811" size={18} />
  //         </a>
  //       </div>
  //       <div className="mt-10 flex items-center gap-x-20">
  //         <div className="flex items-center gap-x-3">
  //           <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
  //             <Mail color="#C3A811" size={22} />
  //           </div>
  //           <div>
  //             <p className="text-[#797878] text-sm">Mail</p>
  //             <p className="text-[#C3A811] text-sm font-bold">
  //               contact@adey-chatbot.website
  //             </p>
  //           </div>
  //         </div>
  //         <div className="flex items-center gap-x-3">
  //           <div className="w-12 h-12 bg-[#FAF3CC] rounded-full flex justify-center items-center">
  //             <MapPin color="#C3A811" size={22} />
  //           </div>
  //           <div>
  //             <p className="text-[#797878] text-sm">Address</p>
  //             <p className="text-[#C3A811] text-sm font-bold">
  //               Warsaw, Poland
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="pt-5 px-20 w-full flex items-center justify-between text-[#797878]">
  //       <div className="flex items-center gap-x-2">
  //       </div>
  //       <p>© 2025 Adey — AI Smart Chatbots for Small Business Success</p>
  //     </div>
  //   </div>
  // );
};

export default Footer;
