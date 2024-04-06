import React from "react";

type ParamType = {
  color?: string;
  size?: number;
  fill?: string;
};
const TargetIcon = ({
  color = "#000000",
  size = 12,
  fill = "none",
}: ParamType) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1M19.6667 13C19.6667 16.6819 16.6819 19.6667 13 19.6667C9.3181 19.6667 6.33333 16.6819 6.33333 13C6.33333 9.3181 9.3181 6.33333 13 6.33333M16.6772 9.46883L21.9558 10.0232L24.8172 6.01723L21.3835 4.87266L20.239 1.43895L16.233 4.30038L16.6772 9.46883ZM16.6772 9.46883L13 12.9999"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TargetIcon;
