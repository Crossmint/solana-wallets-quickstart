"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";

export function DelegatedSigner() {
  const { wallet, type } = useWallet();
  const [status, setStatus] = useState<string>(
    "Allow other signers to sign transactions on behalf of the wallet."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [delegatedSignerOutput, setDelegatedSignerOutput] = useState<any>(null);
  const [delegatedSignerInput, setDelegatedSignerInput] = useState<string>("");

  const handleDelegatedDemo = async () => {
    if (wallet == null || type !== "solana-smart-wallet") {
      throw new Error("No wallet connected");
    }
    if (!delegatedSignerInput) {
      alert("Delegated Signer: no signer provided!");
      return;
    }
    try {
      setIsLoading(true);
      const delegatedSignerData = await wallet.addDelegatedSigner(
        `solana-keypair:${delegatedSignerInput}`
      );
      setStatus("Successfully registered delegated signer!");
      setDelegatedSignerOutput(delegatedSignerData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Try again or use a different signer address.";
      alert("Delegated Signer: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Delegated Signer</h2>
        {!isLoading && <p className="text-sm text-gray-500">{status}</p>}
      </div>
      {delegatedSignerOutput && (
        <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-md">Delegated Signer Details</h3>
          <div className="grid grid-cols-[120px_1fr] gap-1 text-sm">
            <div className="font-medium">Type:</div>
            <div>{delegatedSignerOutput.type}</div>
            <div className="font-medium">Address:</div>
            <div className="break-all">
              {delegatedSignerOutput.locator?.split(":")?.[1] || "N/A"}
            </div>
            {delegatedSignerOutput.transaction && (
              <>
                <div className="font-medium">Status:</div>
                <div className="capitalize">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      delegatedSignerOutput.transaction.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {delegatedSignerOutput.transaction.status}
                  </span>
                </div>
                <div className="font-medium">Created:</div>
                <div>
                  {new Date(
                    delegatedSignerOutput.transaction.createdAt
                  ).toLocaleString()}
                </div>
                {delegatedSignerOutput.transaction.onChain?.txId && (
                  <>
                    <div className="font-medium">Transaction ID:</div>
                    <div className="break-all">
                      <a
                        href={`https://solscan.io/tx/${delegatedSignerOutput.transaction.onChain.txId}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {delegatedSignerOutput.transaction.onChain.txId.substring(
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
          {delegatedSignerOutput.transaction?.approvals && (
            <div className="mt-2">
              <div className="font-medium text-sm mb-1">Approvals:</div>
              <div className="text-xs bg-gray-100 p-2 rounded overflow-y-auto">
                <div>
                  Required:{" "}
                  {delegatedSignerOutput.transaction.approvals.required}
                </div>
                <div>
                  Submitted:{" "}
                  {delegatedSignerOutput.transaction.approvals.submitted.length}
                </div>

                {delegatedSignerOutput.transaction.approvals.submitted.map(
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
                        Time: {new Date(approval.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {delegatedSignerOutput == null ? (
          <>
            <label className="text-sm font-medium">Delegated Signer</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Ex: 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8"
              onChange={(e) => setDelegatedSignerInput(e.target.value)}
            />
          </>
        ) : null}
      </div>
      <button
        className={cn(
          "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
          isLoading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-accent text-white hover:bg-accent/80"
        )}
        onClick={handleDelegatedDemo}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Add Delegated Signer"}
      </button>
    </div>
  );
}
