import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import ApiMethod from "./ApiMethod";
import "./MainContent.css";

const MainContent = ({ selectedMethod, str, isConnected }) => {
  const [result, setResult] = useState(null);
  const [formattedResult, setFormattedResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear result when method changes
  useEffect(() => {
    setResult(null);
    setFormattedResult("");
    setError(null);
  }, [selectedMethod]);

  // Format result when result changes
  useEffect(() => {
    if (result) {
      formatResult(result, selectedMethod).then(setFormattedResult);
    }
  }, [result, selectedMethod]);

  const handleMethodCall = async (methodName, params) => {
    if (!str) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      switch (methodName) {
        case "getAppConfiguration":
          response = await str.getAppConfiguration();
          break;
        case "getPublicKey":
          response = await str.getPublicKey(params.path, params.display);
          break;
        case "signTransaction":
          try {
            // Dynamically import Stellar SDK
            const { TransactionBuilder, Networks } = await import(
              "@stellar/stellar-sdk"
            );

            // Get network passphrase
            const networkPassphrase =
              params.network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;

            // Parse transaction from XDR
            const transaction = TransactionBuilder.fromXDR(
              params.transactionXdr,
              networkPassphrase
            );

            // Get signature base
            const signatureBase = transaction.signatureBase();

            // Sign with Ledger
            response = await str.signTransaction(params.path, signatureBase);
          } catch (error) {
            throw new Error(`Failed to process transaction: ${error.message}`);
          }
          break;
        case "signSorobanAuthorization":
          response = await str.signSorobanAuthorization(
            params.path,
            Buffer.from(params.hashIdPreimage, "base64")
          );
          break;
        case "signHash":
          response = await str.signHash(
            params.path,
            Buffer.from(params.hash, "hex")
          );
          break;
        default:
          throw new Error(`Unknown method: ${methodName}`);
      }

      setResult(response);
    } catch (err) {
      let errorMessage = err.message || "An error occurred";

      // Check if it's the UNKNOWN_APDU error (0x6d02) - user likely hasn't opened Stellar app
      if (err.message && err.message.includes("0x6d02")) {
        errorMessage +=
          "\n\nPlease make sure you have opened the Stellar app on your Ledger device.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatResult = async (result, methodName) => {
    if (!result) return "";

    // Special handling for getPublicKey - return only Stellar address
    if (methodName === "getPublicKey") {
      let publicKeyBuffer = null;

      // Handle different result formats
      if (Buffer.isBuffer(result)) {
        publicKeyBuffer = result;
      } else if (result instanceof Uint8Array) {
        publicKeyBuffer = Buffer.from(result);
      } else if (result.rawPublicKey) {
        // Handle the case where result is {rawPublicKey: Uint8Array}
        publicKeyBuffer = Buffer.from(result.rawPublicKey);
      }

      if (publicKeyBuffer) {
        try {
          // Dynamically import StrKey only when needed
          const { StrKey } = await import("@stellar/stellar-sdk");
          const stellarAddress = StrKey.encodeEd25519PublicKey(publicKeyBuffer);
          return stellarAddress;
        } catch (error) {
          console.error("Failed to encode Stellar address:", error);
          return `Error encoding Stellar address: ${error.message}`;
        }
      }
    }

    // Special handling for signing methods - return base64 encoded signature
    const signingMethods = [
      "signTransaction",
      "signSorobanAuthorization",
      "signHash",
    ];
    if (signingMethods.includes(methodName)) {
      let signatureBuffer = null;

      // Handle different result formats
      if (Buffer.isBuffer(result)) {
        signatureBuffer = result;
      } else if (result instanceof Uint8Array) {
        signatureBuffer = Buffer.from(result);
      } else if (result.signature) {
        // Handle the case where result is {signature: Buffer/Uint8Array}
        if (Buffer.isBuffer(result.signature)) {
          signatureBuffer = result.signature;
        } else if (result.signature instanceof Uint8Array) {
          signatureBuffer = Buffer.from(result.signature);
        } else if (result.signature.data) {
          // Handle the case where signature is {type: "Buffer", data: [numbers]}
          signatureBuffer = Buffer.from(result.signature.data);
        }
      }

      if (signatureBuffer) {
        return signatureBuffer.toString("base64");
      }
    }

    if (Buffer.isBuffer(result)) {
      return result.toString("hex");
    }

    if (result instanceof Uint8Array) {
      return Buffer.from(result).toString("hex");
    }

    if (typeof result === "object") {
      return JSON.stringify(
        result,
        (key, value) => {
          if (Buffer.isBuffer(value)) {
            return value.toString("hex");
          }
          if (value instanceof Uint8Array) {
            return Buffer.from(value).toString("hex");
          }
          return value;
        },
        2
      );
    }

    return String(result);
  };

  return (
    <div className="main-content">
      <div className="content-area">
        <ApiMethod
          methodName={selectedMethod}
          onMethodCall={handleMethodCall}
          isConnected={isConnected}
          loading={loading}
        />

        <div className="result-section">
          <h3>Result</h3>
          <div className="result-container">
            {loading && (
              <div className="result loading">Executing method...</div>
            )}

            {error && (
              <div className="result error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && !loading && (
              <div className="result success">
                <pre>{formattedResult || "Formatting result..."}</pre>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="result placeholder">
                {isConnected
                  ? "Execute an API method to see results"
                  : "Connect your Ledger device first"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
