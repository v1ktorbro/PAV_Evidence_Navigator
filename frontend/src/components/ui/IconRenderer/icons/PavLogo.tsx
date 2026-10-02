import { memo, type FC, type SVGAttributes } from "react";

const PavLogoIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    aria-hidden="true"
    height="100%"
    viewBox="0 0 96 96"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient
        id="pavWater"
        x1="14"
        x2="73"
        y1="13"
        y2="76"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1f5f79" />
        <stop offset="1" stopColor="#123846" />
      </linearGradient>
      <linearGradient
        id="pavOil"
        x1="14"
        x2="74"
        y1="76"
        y2="36"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0a202c" />
        <stop offset="1" stopColor="#0e3341" />
      </linearGradient>
    </defs>
    <rect
      x="1"
      y="1"
      width="94"
      height="94"
      rx="25"
      fill="#071924"
      stroke="#31505b"
      strokeWidth="2"
    />
    <path
      d="M12 50c10-5 19-5 28 1 8 5 17 5 26-1 7-5 13-5 18-2v22H12V50Z"
      fill="url(#pavWater)"
    />
    <path
      d="M12 59c10-5 19-5 28 1 8 5 17 5 26-1 7-5 13-5 18-2v28H12V59Z"
      fill="url(#pavOil)"
    />
    <path
      d="M12 50c10-5 19-5 28 1 8 5 17 5 26-1 7-5 13-5 18-2"
      fill="none"
      stroke="#4ad0a0"
      strokeLinecap="round"
      strokeWidth="3"
    />
    <circle cx="48" cy="29" r="10" fill="#4ad0a0" />
    <circle cx="48" cy="29" r="4" fill="#d9fff0" />
    <path
      d="M44 39v15c0 7-4 13-11 16M52 39v15c0 7 4 13 11 16"
      fill="none"
      stroke="#f5f9f7"
      strokeLinecap="round"
      strokeWidth="4"
    />
    <circle cx="31" cy="70" r="4" fill="#f0ba58" />
    <circle cx="65" cy="70" r="4" fill="#f0ba58" />
    <path
      d="M35 69h9M52 69h9"
      stroke="#f0ba58"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

export default memo(PavLogoIcon);
