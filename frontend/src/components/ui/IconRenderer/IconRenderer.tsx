import {
  type ComponentType,
  type CSSProperties,
  type FC,
  memo,
} from "react";

import ArrowLeftIcon from "./icons/ArrowLeft";
import ArrowRightIcon from "./icons/ArrowRight";
import ExternalLinkIcon from "./icons/ExternalLink";
import QuestionIcon from "./icons/Question";

export type IIconRendererTypes =
  | "arrowLeft"
  | "arrowRight"
  | "externalLink"
  | "question";

export const ICONS_ENUM: Record<
  IIconRendererTypes,
  ComponentType<{ className?: string; style: CSSProperties }>
> = {
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  externalLink: ExternalLinkIcon,
  question: QuestionIcon,
} as const;

const IconRenderer: FC<{
  icon: IIconRendererTypes;
  className?: string;
  style?: CSSProperties;
}> = ({ icon, className, style }) => {
  const Icon = ICONS_ENUM[icon];

  return <Icon className={className} style={{ ...style }} />;
};

export default memo(IconRenderer);
