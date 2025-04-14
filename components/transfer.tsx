"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { PublicKey } from "@solana/web3.js";
import {
  createSolTransferTransaction,
  createTokenTransferTransaction,
} from "@/lib/createTransaction";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useBalance } from "@/lib/balanceContext";

const isSolanaAddressValid = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

interface Transaction {
  id: string;
  token: "sol" | "usdc";
  recipient: string;
  amount: number;
  status: "success" | "pending" | "failed";
  explorerUrl: string;
}

interface Balance {
  token: "sol" | "usdc";
  decimals: number;
  balances: {
    total: string;
  };
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (
    token: "sol" | "usdc",
    recipient: string,
    amount: number
  ) => Promise<void>;
}

function TransferModal({ isOpen, onClose, onTransfer }: TransferModalProps) {
  const { wallet, type } = useWallet();
  const { balances, formatBalance } = useBalance();
  const [token, setToken] = useState<"sol" | "usdc">("sol");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      setError("Missing required fields");
      return;
    }

    if (token === "sol" && !isSolanaAddressValid(recipient)) {
      setError("Invalid Solana recipient address");
      return;
    }

    // Check if amount exceeds balance
    const currentBalance =
      token === "sol"
        ? Number(
            balances.find((t) => t.token === "sol")?.balances.total || "0"
          ) / 1e9
        : Number(
            balances.find((t) => t.token === "usdc")?.balances.total || "0"
          ) / 1e6;

    if (amount > currentBalance) {
      setError(`Insufficient ${token.toUpperCase()} balance`);
      return;
    }

    setError(null);
    try {
      setIsLoading(true);
      await onTransfer(token, recipient, amount);
      setRecipient("");
      setAmount(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer funds");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Transfer Funds</h3>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="token" className="text-sm font-medium">
                Token
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="token"
                    className="h-4 w-4"
                    checked={token === "usdc"}
                    onChange={() => setToken("usdc")}
                  />
                  <span>USDC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="token"
                    className="h-4 w-4"
                    checked={token === "sol"}
                    onChange={() => setToken("sol")}
                  />
                  <span>SOL</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  error?.includes("Insufficient")
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="0.00"
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <span className="text-xs text-gray-500">
                Balance:{" "}
                {token === "sol"
                  ? formatBalance(
                      balances.find((t) => t.token === "sol")?.balances.total ||
                        "0",
                      9
                    )
                  : formatBalance(
                      balances.find((t) => t.token === "usdc")?.balances
                        .total || "0",
                      6
                    )}{" "}
                {token.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="recipient" className="text-sm font-medium">
              Recipient wallet
            </label>
            <input
              id="recipient"
              type="text"
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                error?.includes("Invalid Solana")
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Enter wallet address"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setError(null);
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
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
            onClick={handleTransfer}
            disabled={isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransfer = async (
    token: "sol" | "usdc",
    recipient: string,
    amount: number
  ) => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("No wallet connected");
    }

    // Prevent transfers to admin signer
    if (wallet.adminSigner?.address === recipient) {
      throw new Error("Cannot transfer to admin signer address");
    }

    try {
      const txn =
        token === "sol"
          ? await createSolTransferTransaction(
              wallet.address,
              recipient,
              amount
            )
          : await createTokenTransferTransaction(
              wallet.address,
              recipient,
              "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC token mint
              amount
            );

      const txnHash = await wallet.sendTransaction({
        transaction: txn,
      });

      const explorerUrl = `https://solscan.io/tx/${txnHash}?cluster=devnet`;

      // Add transaction to history
      setTransactions((prev) => [
        {
          id: txnHash,
          token,
          recipient,
          amount,
          status: "success",
          explorerUrl,
        },
        ...prev,
      ]);
    } catch (err) {
      throw new Error(
        `Transfer failed: ${err instanceof Error ? err.message : err}`
      );
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  return (
    <div className="bg-white flex flex-col h-full rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Transfer Funds</h2>
        <p className="text-sm text-gray-500">Send funds to another wallet</p>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No transactions yet
          </p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={`/${tx.token}.svg`}
                    alt={tx.token.toUpperCase()}
                    width={24}
                    height={24}
                  />
                  {tx.status === "pending" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3">
                      <div className="w-full h-full border-2 border-white rounded-full bg-accent animate-ping" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {tx.amount} {tx.token.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    {formatAddress(tx.recipient)}
                  </span>
                </div>
              </div>
              <a
                href={tx.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-100 rounded-full"
                title="View on explorer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-accent text-white hover:bg-accent/80 mt-3"
        onClick={() => setIsModalOpen(true)}
      >
        Transfer
      </button>
      <TransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransfer={handleTransfer}
      />
    </div>
  );
}
