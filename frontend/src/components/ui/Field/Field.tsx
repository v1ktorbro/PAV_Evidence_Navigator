import scss from "./field.module.scss";

import { cloneElement, isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

interface IFieldControlProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

interface IFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  htmlFor: string;
  action?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

const Field = ({
  label,
  htmlFor,
  action,
  hint,
  error,
  required = false,
  children,
  className,
  ...props
}: IFieldProps) => {
  const classNames = [scss.root, className].filter(Boolean).join(" ");
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ");
  const control = isValidElement<IFieldControlProps>(children)
    ? cloneElement(children, {
        "aria-describedby": [
          children.props["aria-describedby"],
          describedBy,
        ]
          .filter(Boolean)
          .join(" "),
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;

  return (
    <div {...props} className={classNames}>
      <div className={scss.labelRow}>
        <label className={scss.label} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={scss.required} aria-hidden="true">
              {" *"}
            </span>
          )}
        </label>
        {action}
      </div>
      {control}
      {hint && (
        <p id={hintId} className={scss.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={scss.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
