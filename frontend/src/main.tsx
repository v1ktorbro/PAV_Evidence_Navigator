import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/reset.scss";
import "./styles/palette.scss";
import "./styles/constants.scss";
import "./styles/global.scss";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
