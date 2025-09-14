import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ConnectionStatus from "./components/ConnectionStatus";
import { useLedgerConnection } from "./hooks/useLedgerConnection";
import "./App.css";

function App() {
  const [selectedMethod, setSelectedMethod] = useState("getAppConfiguration");
  const { str, connectionStatus, connect, disconnect } = useLedgerConnection();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stellar Ledger API Playground</h1>
        <ConnectionStatus
          status={connectionStatus}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </header>

      <div className="app-main">
        <Sidebar
          selectedMethod={selectedMethod}
          onMethodSelect={setSelectedMethod}
          isConnected={connectionStatus === "connected"}
        />
        <MainContent
          selectedMethod={selectedMethod}
          str={str}
          isConnected={connectionStatus === "connected"}
        />
      </div>
    </div>
  );
}

export default App;
