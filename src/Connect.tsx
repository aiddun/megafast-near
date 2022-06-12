import * as nearAPI from "near-api-js";
// import QRCodeModal from '@walletconnect/qrcode-modal/dist/umd/index.min.js'
// import WalletConnect from "@walletconnect/client";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import { useEffect, useState } from "react";

const { connect, keyStores, WalletConnection } = nearAPI;

const config = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

// connect to NEAR
const near = await connect(config);
const wallet = new WalletConnection(near);

const SubmitButton = ({
  onClick,
  disabled,
  title = "Submit",
  loading,
  error,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  loading?: boolean;
  error?: string;
}) => (
  // <span className="inline-flex rounded-md shadow-sm">
  //   <button
  //     type="button"
  //     className="inline-flex items-center px-4 py-2
  //     border border-transparent text-sm leading-5 font-medium r
  //     ounded-md text-white bg-blue-500 hover:bg-blue-900 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
  //   >
  //     Submit
  //   </button>
  // </span>

  <span className="inline-flex shadow-sm">
    <button
      disabled={disabled}
      type="button"
      className={`inline-flex items-center px-3 py-1.5 border border-transparent 
      text-xl leading-5 font-medium  text-white shadow
       ${
         disabled
           ? "bg-blue-600 opacity-70 cursor-default"
           : `bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 
              focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150 `
       }`}
      onClick={onClick}
    >
      {!error ? (
        <div className="h-7 w-7">
          {loading ? (
            // Loading icon
            <svg
              class="animate-spin -ml-1 h-7 w-7 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 -ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      ) : undefined}
      <p className="pl-0.5">{error ?? title}</p>
    </button>
  </span>
);

const Connect = () => {
  const [loading, setLoading] = useState(false);
  const [txid, setTxid] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fn = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("account_id");
      if (id) {
        // var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        // window.history.pushState({path:newurl},'',newurl);

        const body = JSON.stringify({
          address: id,
        });

        console.log(body);

        setLoading(true);
        const response = await fetch(
          "https://ar-backend.aiddun.repl.co/api/near",
          {
            method: "POST",
            body: body,
            headers: { "Content-Type": "application/json" },
          }
        );
        const json = await response.json();
        if (json.error) setError(json.error);
        else setTxid(json.id);
      }
    };
    fn();
  }, []);

  return (
    <div>
      {txid ? (
        <p>
          Transaction confirmed! View it{" "}
          <a
            className="text-blue-700"
            href={`https://explorer.testnet.near.org/transactions/${txid}`}
          >
            here
          </a>
        </p>
      ) : (
        <SubmitButton
          title={loading ? "Processing..." : "Connect Wallet"}
          onClick={async () => {
            const session = await wallet.requestSignIn(
              "", // contract requesting access
              "UT NEAR Faucet"
            );
            console.log(session);
          }}
          loading={loading}
          error={error}
        />
      )}
      {/* <button onClick={() => connector.createSession()}>Connect Wallet</button> */}
    </div>
  );
};
// Create a connector

export default Connect;
