"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import Header from "./components/Header";
import Layout from "./_layout";

const Page = () => {
  return (
    <Layout page="dashboard">
      <div className="container"></div>
    </Layout>
  );
};

export default Page;

export function getParams() {
  return { props: { title: "HomePage" } };
}
