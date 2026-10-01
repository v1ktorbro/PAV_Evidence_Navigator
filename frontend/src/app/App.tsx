import EvidenceNavigator from "./evidence/EvidenceNavigator";
import SourceViewer from "./source/SourceViewer";

const App = () => {
  const sourceMatch = window.location.pathname.match(/^\/source\/([^/]+)$/);

  if (sourceMatch) {
    return <SourceViewer evidenceId={decodeURIComponent(sourceMatch[1])} />;
  }

  return <EvidenceNavigator />;
};

export default App;
