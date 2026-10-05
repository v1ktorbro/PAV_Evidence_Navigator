import scss from "./input.module.scss";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const classNames = [scss.root, className].filter(Boolean).join(" ");

    return <input {...props} ref={ref} className={classNames} />;
  },
);

Input.displayName = "Input";

export default Input;
