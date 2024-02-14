import Image from "next/image";
import React from "react";

type Props = {
  loading: boolean;
};
const Loading = ({ loading }: Props) => {
  return loading ? (
    <div className="w-screen h-screen bg-white flex justify-center items-center absolute top-0 left-0 z-50">
      <div className="loading_fluid relative w-60 h-60 rounded-full bg-[#EDD447]"></div>
    </div>
  ) : (
    <></>
  );
};

export default Loading;
