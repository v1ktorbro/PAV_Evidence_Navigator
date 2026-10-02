import { memo, type FC, type SVGAttributes } from "react";

const ArrowRightIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 11h11.17l-4.88-4.88a1 1 0 0 1 1.42-1.42l6.59 6.59a1 1 0 0 1 0 1.42l-6.59 6.59a1 1 0 0 1-1.42-1.42L16.17 13H5a1 1 0 0 1 0-2Z"
      fill="currentColor"
    />
  </svg>
);

export default memo(ArrowRightIcon);
