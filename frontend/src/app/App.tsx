import type { ReactNode } from "react";

import Header from "../components/Header/Header";
import EvidenceNavigator from "./evidence/EvidenceNavigator";
import DataCompleteness from "./evidence/DataCompleteness";
import SourceViewer from "./source/SourceViewer";
import QualityDashboard from "./quality/QualityDashboard";
import SourcesCatalog from "./sources/SourcesCatalog";

const App = () => {
  const sourceMatch = window.location.pathname.match(/^\/source\/([^/]+)$/);
  let screen: ReactNode;

  if (sourceMatch) {
    screen = <SourceViewer evidenceId={decodeURIComponent(sourceMatch[1])} />;
  } else if (window.location.pathname === "/completeness") {
    screen = <DataCompleteness />;
  } else if (window.location.pathname === "/quality") {
    screen = <QualityDashboard />;
  } else if (window.location.pathname === "/sources") {
    screen = <SourcesCatalog />;
  } else {
    screen = <EvidenceNavigator />;
  }

  return (
    <>
      <Header />
      {screen}
    </>
  );
};

export default App;
