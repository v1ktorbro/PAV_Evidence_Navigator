import { memo, type FC, type SVGAttributes } from "react";

const RemoveIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 7h16M10 11v6m4-6v6M9 7l.7-2.1A1.4 1.4 0 0 1 11.03 4h1.94a1.4 1.4 0 0 1 1.33.9L15 7m3 0-1 13H7L6 7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

export default memo(RemoveIcon);
