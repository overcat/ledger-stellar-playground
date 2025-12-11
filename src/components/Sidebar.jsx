import "./Sidebar.css";

const API_METHODS = [
  {
    id: "getAppConfiguration",
    name: "Get App Configuration",
    description: "Retrieve Stellar app configuration from the device",
  },
  {
    id: "getPublicKey",
    name: "Get Public Key",
    description: "Get a Stellar public key for a given derivation path",
  },
  {
    id: "signTransaction",
    name: "Sign Transaction",
    description: "Sign a TransactionEnvelope",
  },
  {
    id: "signSorobanAuthorization",
    name: "Sign Soroban Authorization",
    description: "Sign a HashIDPreimage",
  },
  {
    id: "signHash",
    name: "Sign Hash",
    description: "Sign an arbitrary hash",
  },
  {
    id: "signMessage",
    name: "Sign Message",
    description: "Sign a message with your Ledger device",
  },
];

const Sidebar = ({ selectedMethod, onMethodSelect, isConnected }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>API Methods</h3>
        {!isConnected && (
          <p className="connection-warning">
            Connect your Ledger device to test APIs
          </p>
        )}
      </div>

      <div className="api-methods">
        {API_METHODS.map((method) => (
          <div
            key={method.id}
            className={`api-method ${
              selectedMethod === method.id ? "active" : ""
            } ${!isConnected ? "disabled" : ""}`}
            onClick={() => isConnected && onMethodSelect(method.id)}
          >
            <div className="method-name">{method.name}</div>
            <div className="method-description">{method.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
