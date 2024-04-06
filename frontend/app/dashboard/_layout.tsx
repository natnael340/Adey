import React from "react";
import Sidebar from "../components/Sidebar";

type Props = {
  children: React.ReactElement;
  page: "dashboard" | "chatbots" | "salesbots" | "integrations" | "account";
};
function layout({ children, page }: Props) {
  return (
    <section className="flex flex-row p-0 m-0 h-screen">
      <Sidebar page={page} />
      <div className="container p-10 bg-[#F8F9FC] h-screen overflow-y-scroll">
        {children}
      </div>
    </section>
  );
}

export default layout;
