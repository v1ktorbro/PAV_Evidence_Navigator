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
    <path
      d="M16 54c10-5 19-5 28 1 8 5 17 5 26-1 5-4 10-4 14-2"
      fill="none"
      stroke="#4ad0a0"
      strokeLinecap="round"
      strokeWidth="4"
    />
    <path
      d="M16 63c10-5 19-5 28 1 8 5 17 5 26-1 5-4 10-4 14-2"
      fill="none"
      opacity="0.45"
      stroke="#31505b"
      strokeLinecap="round"
      strokeWidth="3"
    />
    <circle cx="48" cy="27" r="9" fill="#4ad0a0" />
    <circle cx="48" cy="27" r="3" fill="#d9fff0" />
    <path
      d="M44 38v14c0 7-4 13-11 16M52 38v14c0 7 4 13 11 16"
      fill="none"
      stroke="#f5f9f7"
      strokeLinecap="round"
      strokeWidth="4"
    />
    <circle cx="31" cy="68" r="4" fill="#f0ba58" />
    <circle cx="65" cy="68" r="4" fill="#f0ba58" />
  </svg>
);

export default memo(PavLogoIcon);
