import {
  type ComponentType,
  type CSSProperties,
  type FC,
  memo,
} from "react";

import QuestionIcon from "./icons/Question";
import ExternalLinkIcon from "./icons/ExternalLink";

export type IIconRendererTypes = "externalLink" | "question";

export const ICONS_ENUM: Record<
  IIconRendererTypes,
  ComponentType<{ className?: string; style: CSSProperties }>
> = {
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
