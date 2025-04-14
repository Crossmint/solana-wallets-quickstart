"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PublicKey } from "@solana/web3.js";

const isSolanaAddressValid = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

interface AddSignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSigner: (signer: string) => Promise<void>;
}

interface DelegatedSigner {
  type: "solana-keypair" | "solana-fireblocks-custodial";
  address?: string;
  publicKey?: string;
  locator: string;
}

function AddSignerModal({ isOpen, onClose, onAddSigner }: AddSignerModalProps) {
  const [newSigner, setNewSigner] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSigner = async () => {
    if (!newSigner) {
      setError("No signer provided");
      return;
    }

    if (!isSolanaAddressValid(newSigner)) {
      setError("Invalid Solana address");
      return;
    }

    setError(null);
    try {
      setIsLoading(true);
      await onAddSigner(newSigner);
      setNewSigner("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add signer");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Add Delegated Signer</h3>
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-md text-sm mb-4 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
          placeholder="Enter signer address"
          value={newSigner}
          onChange={(e) => {
            setNewSigner(e.target.value);
            setError(null);
          }}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-md",
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-accent hover:bg-accent/80"
            )}
            onClick={handleAddSigner}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Signer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DelegatedSigner() {
  const { wallet, type } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signers, setSigners] = useState<DelegatedSigner[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet && type === "solana-smart-wallet") {
      fetchSigners();
    }
  }, [wallet, type]);

  const fetchSigners = async () => {
    if (wallet != null && type === "solana-smart-wallet") {
      try {
        const fetchedSigners = await wallet.getDelegatedSigners();
        setSigners(fetchedSigners as DelegatedSigner[]);
      } catch (error) {
        console.error("Error fetching delegated signers:", error);
      }
    }
  };

  const addNewSigner = async (newSigner: string) => {
    if (wallet == null || type !== "solana-smart-wallet") {
      throw new Error("No wallet connected");
    }

    // Check if the new signer is the admin signer
    if (wallet.adminSigner?.address === newSigner) {
      throw new Error("Cannot add admin signer as a delegated signer");
    }

    // Check if the signer already exists
    const existingSigners = await wallet.getDelegatedSigners();
    const signerExists = existingSigners.some((signer) => {
      if ("address" in signer) {
        return signer.address === newSigner;
      }
      if ("publicKey" in signer) {
        return signer.publicKey === newSigner;
      }
      if ("locator" in signer) {
        return signer.locator === `solana-keypair:${newSigner}`;
      }
      return false;
    });

    if (signerExists) {
      throw new Error("This signer is already configured for this wallet");
    }

    try {
      await wallet.addDelegatedSigner(`solana-keypair:${newSigner}`);
      await fetchSigners();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message.toLowerCase()
          : String(error).toLowerCase();
      if (
        errorMessage.includes("invalid") &&
        errorMessage.includes("signature")
      ) {
        window.alert(
          `Invalid Transaction Signer\n\nThe transaction was approved by an unexpected signer. Please ensure that your connected browser wallet is the admin signer: ${wallet.adminSigner?.address}`
        );
        throw new Error("Invalid transaction signer");
      }
      throw error;
    }
  };

  const formatAddress = (address: string) => {
    const cleanAddress = address.replace("solana-keypair:", "");
    return `${cleanAddress.slice(0, 10)}...${cleanAddress.slice(-10)}`;
  };

  return (
    <div className="bg-white flex flex-col h-full rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Delegated Signers</h2>
        <p className="text-sm text-gray-500">
          Authorized signers for your wallet
        </p>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-3">
        {signers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No delegated signers yet
          </p>
        ) : (
          signers.map((signer) => (
            <div
              key={signer.locator}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {formatAddress(signer.locator)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {signer.type === "solana-keypair"
                      ? "Keypair"
                      : "Fireblocks"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    signer.locator.replace("solana-keypair:", "")
                  )
                }
                className="p-1 hover:bg-gray-100 rounded-full"
                title="Copy signer address to clipboard"
              >
                <Image
                  src="/copy.svg"
                  alt="Copy address to clipboard"
                  width={12}
                  height={12}
                />
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        className={cn(
          "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors mt-3",
          isLoading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-accent text-white hover:bg-accent/80"
        )}
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        Add Delegated Signer
      </button>
      <AddSignerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSigner={addNewSigner}
      />
    </div>
  );
}
