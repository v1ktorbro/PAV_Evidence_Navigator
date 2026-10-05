import {
  type ComponentType,
  type CSSProperties,
  type FC,
  memo,
} from "react";

import ArrowLeftIcon from "./icons/ArrowLeft";
import ArrowRightIcon from "./icons/ArrowRight";
import AnalyticsReportIcon from "./icons/AnalyticsReport";
import DownloadIcon from "./icons/Download";
import ExternalLinkIcon from "./icons/ExternalLink";
import PavLogoIcon from "./icons/PavLogo";
import QuestionIcon from "./icons/Question";
import ReloadIcon from "./icons/Reload";
import SynapseResearchIcon from "./icons/SynapseResearch";

export type IIconRendererTypes =
  | "analyticsReport"
  | "arrowLeft"
  | "arrowRight"
  | "download"
  | "externalLink"
  | "pavLogo"
  | "question"
  | "reload"
  | "synapseResearch";

export const ICONS_ENUM: Record<
  IIconRendererTypes,
  ComponentType<{ className?: string; style: CSSProperties }>
> = {
  analyticsReport: AnalyticsReportIcon,
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  download: DownloadIcon,
  externalLink: ExternalLinkIcon,
  pavLogo: PavLogoIcon,
  question: QuestionIcon,
  reload: ReloadIcon,
  synapseResearch: SynapseResearchIcon,
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
