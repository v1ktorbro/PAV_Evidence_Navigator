import {
  Arrow,
  Content,
  Portal,
  Root,
  Trigger,
  type PopoverContentProps,
  type PopoverProps,
} from "@radix-ui/react-popover";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import scss from "./tooltip.module.scss";

interface ITooltip extends Omit<PopoverProps, "children"> {
  children: ReactNode;
  target: ReactElement;
  trigger?: "hover" | "click";
  matchTriggerParentWidth?: boolean;
  classes?: Partial<Record<"root" | "arrow", string>>;
  contentProps?: Pick<
    PopoverContentProps,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "avoidCollisions"
    | "collisionPadding"
  >;
}

const Tooltip = ({
  children,
  target,
  trigger = "hover",
  matchTriggerParentWidth = true,
  classes,
  contentProps,
  defaultOpen = false,
  onOpenChange,
  open,
  ...props
}: ITooltip) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isHoverOpen, setIsHoverOpen] = useState(defaultOpen);
  const [parentWidth, setParentWidth] = useState<number>();

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (trigger === "hover" && open === undefined) {
        setIsHoverOpen(isOpen);
      }

      onOpenChange?.(isOpen);
    },
    [onOpenChange, open, trigger],
  );

  const handlePointerEnter = useCallback(() => {
    if (trigger === "hover") {
      handleOpenChange(true);
    }
  }, [handleOpenChange, trigger]);

  const handlePointerLeave = useCallback(() => {
    if (trigger === "hover") {
      handleOpenChange(false);
    }
  }, [handleOpenChange, trigger]);

  useEffect(() => {
    if (!matchTriggerParentWidth) {
      setParentWidth(undefined);

      return;
    }

    const parent = triggerRef.current?.parentElement;

    if (!parent) {
      return;
    }

    const updateParentWidth = () => {
      setParentWidth(parent.getBoundingClientRect().width);
    };
    const observer = new ResizeObserver(updateParentWidth);

    updateParentWidth();
    observer.observe(parent);

    return () => observer.disconnect();
  }, [matchTriggerParentWidth]);

  const isOpen = trigger === "hover" ? (open ?? isHoverOpen) : open;
  const rootClassName = [scss.root, classes?.root].filter(Boolean).join(" ");
  const arrowClassName = [scss.arrow, classes?.arrow]
    .filter(Boolean)
    .join(" ");

  return (
    <Root
      {...props}
      defaultOpen={trigger === "click" ? defaultOpen : undefined}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <Trigger
        ref={triggerRef}
        asChild
        onBlur={handlePointerLeave}
        onFocus={handlePointerEnter}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {target}
      </Trigger>

      <Portal>
        <Content
          {...contentProps}
          className={rootClassName}
          role="tooltip"
          style={
            matchTriggerParentWidth && parentWidth
              ? { width: parentWidth }
              : undefined
          }
        >
          {children}
          <Arrow className={arrowClassName} />
        </Content>
      </Portal>
    </Root>
  );
};

export default memo(Tooltip);
