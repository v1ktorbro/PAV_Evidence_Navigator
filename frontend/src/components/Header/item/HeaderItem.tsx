import scss from "./headerItem.module.scss";

import { memo, type MouseEventHandler } from "react";

import type { IHeaderNavigationItem } from "../headerNavigation";

interface IHeaderItem {
  item: IHeaderNavigationItem;
  isActive: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const HeaderItem = ({ item, isActive, onClick }: IHeaderItem) => (
  <a
    className={`${scss.root} ${isActive ? scss.active : ""}`}
    href={item.href}
    aria-current={isActive ? "page" : undefined}
    onClick={onClick}
  >
    {item.label}
  </a>
);

export default memo(HeaderItem);
