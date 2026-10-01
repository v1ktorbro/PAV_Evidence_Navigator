import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
  type TooltipContentProps,
} from "@radix-ui/react-tooltip";
import { memo, type ReactElement, type ReactNode } from "react";

import scss from "./tooltip.module.scss";

interface ITooltip {
  children: ReactNode;
  target: ReactElement;
  classes?: Partial<Record<"root" | "arrow", string>>;
  contentProps?: Pick<
    TooltipContentProps,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "avoidCollisions"
    | "collisionPadding"
  >;
}

interface ITooltipProvider {
  children: ReactNode;
}

export const TooltipProvider = ({ children }: ITooltipProvider) => (
  <Provider delayDuration={300} skipDelayDuration={500}>
    {children}
  </Provider>
);

const Tooltip = ({ children, target, classes, contentProps }: ITooltip) => {
  const rootClassName = [scss.root, classes?.root].filter(Boolean).join(" ");
  const arrowClassName = [scss.arrow, classes?.arrow]
    .filter(Boolean)
    .join(" ");

  return (
    <Root>
      <Trigger asChild>{target}</Trigger>
      <Portal>
        <Content {...contentProps} className={rootClassName}>
          {children}
          <Arrow className={arrowClassName} />
        </Content>
      </Portal>
    </Root>
  );
};

export default memo(Tooltip);
