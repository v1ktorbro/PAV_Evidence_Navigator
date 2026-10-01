import type { ButtonHTMLAttributes, FC } from "react";

import scss from "./button.module.scss";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: FC<IButton> = ({
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const classNames = [scss.root, scss[variant], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button {...props} className={classNames}>
      {children}
    </button>
  );
};

export default Button;
