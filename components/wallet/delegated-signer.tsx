"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { Keypair } from "@solana/web3.js";
import { createTokenTransferTransaction } from "@/lib/transaction/createTransaction";

export function DelegatedSigner() {
  const { wallet, type } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [delegatedSignerData, setDelegatedSignerData] = useState<any>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUsdcBalance() {
      if (!wallet || type !== "solana-smart-wallet") return;
      const data = (await wallet.balances(["usdc"])) as any[];
      const balance = data.find((t: any) => t.token === "usdc")?.balances.total;
      setUsdcBalance(balance);
    }
    if (wallet) {
      fetchUsdcBalance();
    }
  }, [wallet, type]);

  const hasEnoughUSDC =
    Number((Number(usdcBalance) / Math.pow(10, 6)).toFixed(2)) >= 1;

  const handleDelegatedDemo = async () => {
    if (wallet == null || type !== "solana-smart-wallet") {
      throw new Error("No wallet connected");
    }
    try {
      setIsLoading(true);
      setStatus("Generating delegated key...");

      // 1. Generate a keypair
      const delegatedSigner = Keypair.generate();
      const delegatedSignerAddress = delegatedSigner.publicKey.toString();

      setStatus(`Generated delegated key: ${delegatedSignerAddress}`);

      // 2. Register the delegated signer with the wallet
      setStatus("Registering delegated signer...");
      const delegatedSignerData = await wallet.addDelegatedSigner(
        `solana-keypair:${delegatedSignerAddress}`
      );

      // Display success message
      setStatus("Successfully registered delegated signer!");
      setDelegatedSignerData(delegatedSignerData);

      // 3. Perform a transfer of 1 USDC using the delegated signer
      setStatus("Performing transfer of funds...");

      const transfer1USDCTxn = await createTokenTransferTransaction(
        wallet.getAddress(),
        "AVLmXspYL3nSzrAQUHgwMnJQKYBQX2eaNYzhv7HMxzFA", // Demo wallet to send funds to
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC token mint
        1
      );

      const transferResponse = await wallet.sendTransaction({
        transaction: transfer1USDCTxn,
        delegatedSigner: {
          address: delegatedSignerAddress,
          type: "solana-keypair",
          signer: delegatedSigner,
        },
      });

      setStatus("Transfer of funds completed!");
      console.log("Transfer response:", transferResponse);
    } catch (err) {
      console.error(err);
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm">
      <div className="p-5 pb-0">
        <h2 className="text-lg font-medium">Delegated Signer (Advanced)</h2>
        {delegatedSignerData != null || isLoading ? null : (
          <p className="text-sm text-gray-500 mt-1">
            Allow a delegated signer to control the wallet. Requires 1 USDC.
          </p>
        )}
      </div>
      <div className="p-5 space-y-4">
        {status && <div className="text-sm text-gray-600 mb-2">{status}</div>}
        {delegatedSignerData && (
          <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-md">Delegated Signer Details</h3>
            <div className="grid grid-cols-[120px_1fr] gap-1 text-sm">
              <div className="font-medium">Type:</div>
              <div>{delegatedSignerData.type}</div>
              <div className="font-medium">Address:</div>
              <div className="break-all">
                {delegatedSignerData.locator?.split(":")?.[1] || "N/A"}
              </div>
              {delegatedSignerData.transaction && (
                <>
                  <div className="font-medium">Status:</div>
                  <div className="capitalize">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        delegatedSignerData.transaction.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {delegatedSignerData.transaction.status}
                    </span>
                  </div>
                  <div className="font-medium">Created:</div>
                  <div>
                    {new Date(
                      delegatedSignerData.transaction.createdAt
                    ).toLocaleString()}
                  </div>
                  {delegatedSignerData.transaction.onChain?.txId && (
                    <>
                      <div className="font-medium">Transaction ID:</div>
                      <div className="break-all">
                        <a
                          href={`https://solscan.io/tx/${delegatedSignerData.transaction.onChain.txId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {delegatedSignerData.transaction.onChain.txId.substring(
                            0,
                            12
                          )}
                          ...
                        </a>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            {delegatedSignerData.transaction?.approvals && (
              <div className="mt-2">
                <div className="font-medium text-sm mb-1">Approvals:</div>
                <div className="text-xs bg-gray-100 p-2 rounded overflow-y-auto">
                  <div>
                    Required:{" "}
                    {delegatedSignerData.transaction.approvals.required}
                  </div>
                  <div>
                    Submitted:{" "}
                    {delegatedSignerData.transaction.approvals.submitted.length}
                  </div>

                  {delegatedSignerData.transaction.approvals.submitted.map(
                    (approval: any, i: number) => (
                      <div
                        key={i}
                        className="mt-1 pl-2 border-l-2 border-gray-300"
                      >
                        <div>
                          Signer:{" "}
                          {approval.signer.split(":")?.[1] || approval.signer}
                        </div>
                        <div>
                          Time:{" "}
                          {new Date(approval.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isLoading || !hasEnoughUSDC
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
          onClick={handleDelegatedDemo}
          disabled={isLoading || !hasEnoughUSDC}
        >
          {isLoading
            ? "Processing..."
            : hasEnoughUSDC
            ? "Perform Delegated Demo"
            : "Need 1 USDC"}
        </button>
        <div className="text-xs text-gray-500">
          You can only perform this action 10 times. Deleting delegated signers
          coming soon.
        </div>
      </div>
    </div>
  );
}
