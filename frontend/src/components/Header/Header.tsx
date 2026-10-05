import scss from "./header.module.scss";

import { memo } from "react";

import IconRenderer from "../ui/IconRenderer/IconRenderer";
import HeaderNav from "./nav/HeaderNav";

const Header = () => (
  <header className={scss.root}>
    <a
      className={scss.logoLink}
      href="/"
      aria-label="PAV Evidence Navigator — к доказательной базе"
    >
      <IconRenderer className={scss.logo} icon="pavLogo" />
      <span className={scss.logoText}>
        <strong>PAV</strong>
        <span>Evidence Navigator</span>
      </span>
    </a>

    <HeaderNav />
  </header>
);

export default memo(Header);
