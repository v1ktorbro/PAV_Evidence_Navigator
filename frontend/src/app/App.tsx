import EvidenceNavigator from "./evidence/EvidenceNavigator";
import DataCompleteness from "./evidence/DataCompleteness";
import SourceViewer from "./source/SourceViewer";

const App = () => {
  const sourceMatch = window.location.pathname.match(/^\/source\/([^/]+)$/);

  if (sourceMatch) {
    return <SourceViewer evidenceId={decodeURIComponent(sourceMatch[1])} />;
  }

  if (window.location.pathname === "/completeness") {
    return <DataCompleteness />;
  }

  return <EvidenceNavigator />;
};

export default App;
