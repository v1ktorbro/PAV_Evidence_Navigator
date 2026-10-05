import EvidenceNavigator from "./evidence/EvidenceNavigator";
import DataCompleteness from "./evidence/DataCompleteness";
import SourceViewer from "./source/SourceViewer";
import QualityDashboard from "./quality/QualityDashboard";
import SourcesCatalog from "./sources/SourcesCatalog";

const App = () => {
  const sourceMatch = window.location.pathname.match(/^\/source\/([^/]+)$/);

  if (sourceMatch) {
    return <SourceViewer evidenceId={decodeURIComponent(sourceMatch[1])} />;
  }

  if (window.location.pathname === "/completeness") {
    return <DataCompleteness />;
  }

  if (window.location.pathname === "/quality") {
    return <QualityDashboard />;
  }

  if (window.location.pathname === "/sources") {
    return <SourcesCatalog />;
  }

  return <EvidenceNavigator />;
};

export default App;
