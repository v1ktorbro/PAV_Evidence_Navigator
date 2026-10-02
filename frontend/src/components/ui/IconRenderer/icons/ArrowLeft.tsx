import { memo, type FC, type SVGAttributes } from "react";

const ArrowLeftIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19 11H7.83l4.88-4.88a1 1 0 0 0-1.42-1.42l-6.59 6.59a1 1 0 0 0 0 1.42l6.59 6.59a1 1 0 0 0 1.42-1.42L7.83 13H19a1 1 0 0 0 0-2Z"
      fill="currentColor"
    />
  </svg>
);

export default memo(ArrowLeftIcon);
