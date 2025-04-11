"use client";

import { useEffect, useState } from "react";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function DelegatedSigner() {
  const { wallet, type } = useWallet();
  const { jwt } = useAuth();
  const [status, setStatus] = useState<string>(
    "Allow other signers to sign transactions on behalf of the wallet."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [delegatedSignerOutput, setDelegatedSignerOutput] = useState<any>([]);
  const [delegatedSignerInput, setDelegatedSignerInput] = useState<string>("");

  // TODO: remove when wallets sdk version bumps
  const fetchDelegatedSigners = async () => {
    try {
      const walletResponse = await fetch(
        "https://staging.crossmint.com/api/2022-06-09/wallets/me:solana-smart-wallet",
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || "",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const meWallet = await walletResponse.json();
      const signers = meWallet.config?.delegatedSigners ?? [];
      setDelegatedSignerOutput(signers);
    } catch (err) {
      console.error("Error fetching delegated signers:", err);
    }
  };

  useEffect(() => {
    fetchDelegatedSigners();
  }, [wallet, jwt]);

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
      await wallet.addDelegatedSigner(`solana-keypair:${delegatedSignerInput}`);
      await fetchDelegatedSigners();
      setStatus("Successfully registered delegated signer!");
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
      {delegatedSignerOutput.length > 0 && (
        <div className="bg-gray-50 py-2 px-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1.5">
            {delegatedSignerOutput.length} signer
            {delegatedSignerOutput.length !== 1 ? "s" : ""} registered
          </p>
          {delegatedSignerOutput.length > 0 && (
            <ul className="space-y-0.5">
              {delegatedSignerOutput.map((signer: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center gap-2 bg-white px-2 py-1 rounded text-xs text-gray-600 border border-gray-100"
                >
                  {(() => {
                    const address = signer.locator?.split(":")?.[1];
                    if (!address || address === "N/A") return "N/A";
                    const length = address.length;
                    if (length <= 8) return address;
                    return `${address.substring(0, 4)}...${address.substring(
                      length - 4
                    )}`;
                  })()}
                  <button
                    onClick={() => {
                      const address = signer.locator?.split(":")?.[1];
                      if (address && address !== "N/A") {
                        navigator.clipboard.writeText(address);
                        const button =
                          document.activeElement as HTMLButtonElement;
                        button.disabled = true;
                        const originalContent = button.innerHTML;
                        button.innerHTML = `<img src="/check.svg" alt="Check" width="12" height="12" />`;
                        setTimeout(() => {
                          button.innerHTML = originalContent;
                          button.disabled = false;
                        }, 2000);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Image src="/copy.svg" alt="Copy" width={12} height={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Add a Delegated Signer</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md text-sm"
          placeholder="Ex: 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8"
          onChange={(e) => setDelegatedSignerInput(e.target.value)}
        />
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
