import scss from "./textarea.module.scss";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const classNames = [scss.root, className].filter(Boolean).join(" ");

    return <textarea {...props} ref={ref} className={classNames} />;
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
