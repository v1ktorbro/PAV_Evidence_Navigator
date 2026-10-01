import { memo, type FC, type SVGAttributes } from "react";

const QuestionIcon: FC<SVGAttributes<SVGElement>> = (props) => (
  <svg
    fill="none"
    height="100%"
    viewBox="0 0 14 14"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="7"
      cy="7"
      r="5.83333"
      stroke="currentColor"
      strokeWidth="1.16667"
    />
    <path
      d="M5.25 5.25C5.25 4.2835 6.0335 3.5 7 3.5C7.9665 3.5 8.75 4.2835 8.75 5.25C8.75 6.2165 7.9665 7 7 7V8.16667"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.16667"
    />
    <path
      d="M7 10.5H7.00583"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.16667"
    />
  </svg>
);

export default memo(QuestionIcon);
