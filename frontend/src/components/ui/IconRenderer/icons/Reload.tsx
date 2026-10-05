import { memo, type FC, type SVGAttributes } from "react";

const ReloadIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M1 12A11 11 0 0 1 17.882 2.7l1.411-1.41A1 1 0 0 1 21 2v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-.707-1.707l1.128-1.128A8.994 8.994 0 0 0 3 12a1 1 0 0 1-2 0Zm21-1a1 1 0 0 0-1 1 9.01 9.01 0 0 1-9 9 8.9 8.9 0 0 1-4.42-1.166l1.127-1.127A1 1 0 0 0 8 17H4a1 1 0 0 0-1 1v4a1 1 0 0 0 .617.924A.987.987 0 0 0 4 23a1 1 0 0 0 .707-.293L6.118 21.3A10.891 10.891 0 0 0 12 23a11.013 11.013 0 0 0 11-11 1 1 0 0 0-1-1Z"
      fill="currentColor"
    />
  </svg>
);

export default memo(ReloadIcon);
