import { useState, useEffect, useCallback } from "react";
import "./ApiMethod.css";

const API_METHOD_CONFIGS = {
  getAppConfiguration: {
    title: "Get App Configuration",
    description:
      "Retrieve the Stellar app configuration from your Ledger device.",
    parameters: [],
  },
  getPublicKey: {
    title: "Get Public Key",
    description:
      "Retrieve a Stellar public key for the specified derivation path.",
    parameters: [
      {
        name: "accountIndex",
        label: "Account Index",
        type: "number",
        placeholder: "0",
        required: true,
        description:
          "Account index for derivation path 44'/148'/x' (default: 0)",
        min: 0,
      },
      {
        name: "display",
        label: "Display on Device",
        type: "checkbox",
        description:
          "Show the address on the Ledger device screen for verification",
      },
    ],
  },
  signTransaction: {
    title: "Sign Transaction",
    description: "Sign a Stellar transaction using your Ledger device.",
    parameters: [
      {
        name: "accountIndex",
        label: "Account Index",
        type: "number",
        placeholder: "0",
        required: true,
        description:
          "Account index for derivation path 44'/148'/x' (default: 0)",
        min: 0,
      },
      {
        name: "network",
        label: "Network",
        type: "select",
        options: [
          { value: "testnet", label: "Testnet" },
          { value: "pubnet", label: "Public Network" },
        ],
        required: true,
        description: "Select the Stellar network for the transaction",
      },
      {
        name: "transactionXdr",
        label: "Transaction Envelope XDR",
        type: "textarea",
        placeholder: "Enter transaction envelope XDR string",
        required: true,
        description: "Transaction envelope XDR as base64 string",
      },
    ],
  },
  signSorobanAuthorization: {
    title: "Sign Soroban Authorization",
    description: "Sign a HashIDPreimage.",
    parameters: [
      {
        name: "accountIndex",
        label: "Account Index",
        type: "number",
        placeholder: "0",
        required: true,
        description:
          "Account index for derivation path 44'/148'/x' (default: 0)",
        min: 0,
      },
      {
        name: "hashIdPreimage",
        label: "HashIDPreimage XDR",
        type: "textarea",
        placeholder: "Enter HashIDPreimage in base64 format",
        required: true,
        description: "HashIDPreimage as base64 string",
      },
    ],
  },
  signHash: {
    title: "Sign Hash",
    description: "Sign an arbitrary hash using your Ledger device.",
    parameters: [
      {
        name: "accountIndex",
        label: "Account Index",
        type: "number",
        placeholder: "0",
        required: true,
        description:
          "Account index for derivation path 44'/148'/x' (default: 0)",
        min: 0,
      },
      {
        name: "hash",
        label: "Hash (Hex)",
        type: "textarea",
        placeholder: "Enter hash in hexadecimal format",
        required: true,
        description: "Hash to sign as hex string (32 bytes)",
      },
    ],
  },
  signMessage: {
    title: "Sign Message",
    description: "Sign a message using your Ledger device.",
    parameters: [
      {
        name: "accountIndex",
        label: "Account Index",
        type: "number",
        placeholder: "0",
        required: true,
        description:
          "Account index for derivation path 44'/148'/x' (default: 0)",
        min: 0,
      },
      {
        name: "inputFormat",
        label: "Input Format",
        type: "select",
        options: [
          { value: "text", label: "Text (UTF-8)" },
          { value: "base64", label: "Base64 Encoded" },
        ],
        required: true,
        description: "Format of the input message",
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Enter message to sign",
        required: true,
        description: "Message to sign (text or base64 depending on input format)",
      },
    ],
  },
};

const ApiMethod = ({ methodName, onMethodCall, isConnected, loading }) => {
  const config = API_METHOD_CONFIGS[methodName];

  // Initialize form data with default values
  const getInitialFormData = useCallback(() => {
    const initialData = {};
    if (config?.parameters) {
      config.parameters.forEach((param) => {
        if (param.name === "accountIndex") {
          initialData[param.name] = "0";
        } else if (param.name === "network") {
          initialData[param.name] = "testnet";
        } else if (param.name === "inputFormat") {
          initialData[param.name] = "text";
        }
      });
    }
    return initialData;
  }, [config]);

  const [formData, setFormData] = useState(getInitialFormData);

  // Reset form data when method changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [methodName, getInitialFormData]);

  if (!config) {
    return (
      <div className="api-method-container">Unknown method: {methodName}</div>
    );
  }

  const handleInputChange = (paramName, value) => {
    setFormData((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected || loading) return;

    const params = {};
    for (const param of config.parameters) {
      if (param.type === "checkbox") {
        params[param.name] = !!formData[param.name];
      } else if (param.name === "accountIndex") {
        // Convert accountIndex to full derivation path
        const accountIndex = formData[param.name] || "0";
        params["path"] = `44'/148'/${accountIndex}'`;
      } else {
        params[param.name] = formData[param.name] || "";
      }
    }

    onMethodCall(methodName, params);
  };

  const isFormValid = () => {
    return config.parameters
      .filter((param) => param.required)
      .every((param) => {
        const value = formData[param.name];
        if (param.type === "number") {
          return value !== undefined && value !== null && value !== "";
        }
        return value?.trim();
      });
  };

  return (
    <div className="api-method-container">
      <div className="method-header">
        <h2>{config.title}</h2>
        <p className="method-description">{config.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="method-form">
        {config.parameters.map((param) => (
          <div key={param.name} className="form-group">
            <label className="form-label">
              {param.label}
              {param.required && <span className="required">*</span>}
            </label>

            {param.type === "textarea" ? (
              <textarea
                className="form-input"
                placeholder={param.placeholder}
                value={formData[param.name] || ""}
                onChange={(e) => handleInputChange(param.name, e.target.value)}
                disabled={!isConnected || loading}
                rows={4}
              />
            ) : param.type === "checkbox" ? (
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={!!formData[param.name]}
                  onChange={(e) =>
                    handleInputChange(param.name, e.target.checked)
                  }
                  disabled={!isConnected || loading}
                />
                <span className="checkbox-label">{param.description}</span>
              </div>
            ) : param.type === "select" ? (
              <select
                className="form-input"
                value={formData[param.name] || ""}
                onChange={(e) => handleInputChange(param.name, e.target.value)}
                disabled={!isConnected || loading}
              >
                <option value="">Select {param.label}</option>
                {param.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={param.type}
                className="form-input"
                placeholder={param.placeholder}
                value={formData[param.name] || ""}
                onChange={(e) => handleInputChange(param.name, e.target.value)}
                disabled={!isConnected || loading}
                min={param.min}
                step={param.step}
              />
            )}

            {param.description && param.type !== "checkbox" && (
              <p className="param-description">{param.description}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="execute-btn"
          disabled={
            !isConnected ||
            loading ||
            (config.parameters.length > 0 && !isFormValid())
          }
        >
          {loading ? "Executing..." : "Execute"}
        </button>
      </form>
    </div>
  );
};

export default ApiMethod;
