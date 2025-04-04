"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { Keypair } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthenticatedCard } from "../ui/crossmint/auth-card";
import { createTokenTransferTransaction } from "@/lib/transaction/createTransaction";

export function DelegatedSigner() {
  const { wallet, type } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [delegatedSignerData, setDelegatedSignerData] = useState<any>(null);

  const { data: usdcBalance } = useQuery({
    queryKey: ["usdc-wallet-balance"],
    queryFn: async () => {
      if (!wallet || type !== "solana-smart-wallet") return [];
      const data = (await wallet.balances(["usdc"])) as any[];
      return data.find((t: any) => t.token === "usdc")?.balances.total;
    },
    enabled: wallet != null,
  });

  const hasEnoughUSDC =
    Number((Number(usdcBalance) / Math.pow(10, 6)).toFixed(2)) >= 1;

  const handleDelegatedDemo = async () => {
    if (wallet == null || type !== "solana-smart-wallet") {
      throw new Error("No wallet connected");
    }
    try {
      setIsLoading(true);
      setStatus("Generating delegated key...");

      // 1. Generate a keypair via the server endpoint
      const keyResponse = await fetch("/api/generate-delegated-key", {
        method: "POST",
      });
      const keyData = (await keyResponse.json()) as {
        success: boolean;
        address: string;
        secretKey: Uint8Array;
      };

      const secretKey = new Uint8Array(keyData.secretKey);
      const delegatedSigner = Keypair.fromSecretKey(secretKey);

      if (!keyData.success) {
        throw new Error("Failed to generate delegated key");
      }
      setStatus(`Generated delegated key: ${keyData.address}`);

      // 2. Register the delegated signer with the wallet
      setStatus("Registering delegated signer...");
      const delegatedSignerData = await wallet.addDelegatedSigner(
        `solana-keypair:${keyData.address}`
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
          address: keyData.address,
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
    <AuthenticatedCard className="gap-3">
      <CardHeader>
        <CardTitle>Delegated Signer (AI Agent use-case)</CardTitle>
        {delegatedSignerData != null || isLoading ? null : (
          <CardDescription>
            Allow a delegated signer to obtain partial or full control of the
            wallet. You will need 1 USDC in your wallet to perform this action.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {status && <div className="text-sm text-gray-600 mb-2">{status}</div>}
        <div>
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
                {/* Display delegated signer transaction details */}
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
                      {
                        delegatedSignerData.transaction.approvals.submitted
                          .length
                      }
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
        </div>
        <Button
          className="w-full"
          onClick={handleDelegatedDemo}
          disabled={isLoading || !hasEnoughUSDC}
        >
          {isLoading
            ? "Performing Delegated Demo..."
            : hasEnoughUSDC
            ? "Perform Delegated Demo"
            : "Not enough USDC in wallet"}
        </Button>
        <div className="text-xs text-gray-500">
          You can only perform this action successfully 10 times. We'll support
          deleting delegated signers soon.
        </div>
      </CardContent>
    </AuthenticatedCard>
  );
}
