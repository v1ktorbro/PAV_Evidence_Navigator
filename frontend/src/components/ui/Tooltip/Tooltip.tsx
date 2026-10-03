import scss from "./tooltip.module.scss";

import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
  type TooltipContentProps,
} from "@radix-ui/react-tooltip";
import {
  cloneElement,
  memo,
  useState,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";

interface ITooltipTrigger {
  onClick?: MouseEventHandler<HTMLElement>;
}

interface ITooltip {
  children: ReactNode;
  target: ReactElement<ITooltipTrigger>;
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
  const [isOpen, setIsOpen] = useState(false);
  const rootClassName = [scss.root, classes?.root].filter(Boolean).join(" ");
  const arrowClassName = [scss.arrow, classes?.arrow]
    .filter(Boolean)
    .join(" ");

  const handleTargetClick: MouseEventHandler<HTMLElement> = (event) => {
    target.props.onClick?.(event);

    if (!event.defaultPrevented) {
      setIsOpen((wasOpen) => !wasOpen);
    }
  };

  const trigger = cloneElement(target, { onClick: handleTargetClick });

  return (
    <Root open={isOpen} onOpenChange={setIsOpen}>
      <Trigger asChild>{trigger}</Trigger>
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
