import { memo, type FC, type SVGAttributes } from "react";

const CopyIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 7.75A2.75 2.75 0 0 1 10.75 5h7.5A2.75 2.75 0 0 1 21 7.75v7.5A2.75 2.75 0 0 1 18.25 18h-7.5A2.75 2.75 0 0 1 8 15.25v-7.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M16 5V4.75A2.75 2.75 0 0 0 13.25 2h-7.5A2.75 2.75 0 0 0 3 4.75v7.5A2.75 2.75 0 0 0 5.75 15H8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

export default memo(CopyIcon);
