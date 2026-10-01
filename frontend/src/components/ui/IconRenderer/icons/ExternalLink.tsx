import { memo, type FC, type SVGAttributes } from "react";

const ExternalLinkIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 24 24"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20 11a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1Z"
      fill="currentColor"
    />
    <path
      d="M16 5h1.58l-6.29 6.28a1 1 0 0 0 1.42 1.42L19 6.42V8a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2Z"
      fill="currentColor"
    />
  </svg>
);

export default memo(ExternalLinkIcon);
