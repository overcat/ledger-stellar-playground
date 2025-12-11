import { useState } from "react";
import "./ConnectionStatus.css";

const ConnectionStatus = ({ status, error, onConnect, onDisconnect }) => {
  const [transportType, setTransportType] = useState("webusb");

  const handleConnect = async () => {
    try {
      await onConnect(transportType);
    } catch {
      // Error is already handled in the hook, just catch to prevent unhandled promise rejection
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "#4ade80";
      case "connecting":
        return "#fbbf24";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="connection-status">
      <div className="connection-header">
        <div className="connection-info">
          <div
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="connection-controls">
          {status !== "connected" && (
            <>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="transport-select"
                disabled={status === "connecting"}
              >
                <option value="webusb">WebUSB</option>
                <option value="webhid">WebHID</option>
              </select>
              <button
                onClick={handleConnect}
                disabled={status === "connecting"}
                className="connect-btn"
              >
                Connect
              </button>
            </>
          )}

          {status === "connected" && (
            <button onClick={onDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          )}
        </div>
      </div>

      {error && status === "error" && (
        <div className="error-message">
          <p>
            <strong>Connection failed:</strong> {error}
          </p>
          <p>
            Please try switching to{" "}
            {transportType === "webusb" ? "WebHID" : "WebUSB"} and connect
            again.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
