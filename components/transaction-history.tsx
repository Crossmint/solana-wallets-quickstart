"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";

export type TransactionStatus = "pending" | "success" | "expired";

export interface Transaction {
  id: string;
  token: "sol" | "usdc";
  recipient: string;
  amount: number;
  status: TransactionStatus;
  timestamp: number;
  explorerUrl: string;
}

export interface TransactionHistoryRef {
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  getTransactionsLength: () => number;
}

export const TransactionHistory = forwardRef<TransactionHistoryRef>(
  (_, ref) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useImperativeHandle(ref, () => ({
      addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => {
        setTransactions((prev) => [
          {
            ...tx,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      },
      updateTransactionStatus: (id: string, status: TransactionStatus) => {
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? { ...tx, status } : tx))
        );
      },
      getTransactionsLength: () => transactions.length,
    }));

    useEffect(() => {
      // Check for expired transactions every minute
      const interval = setInterval(() => {
        setTransactions((prev) =>
          prev.map((tx) => {
            if (
              tx.status === "pending" &&
              Date.now() - tx.timestamp > 60000 // 1 minute
            ) {
              return { ...tx, status: "expired" };
            }
            return tx;
          })
        );
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    const formatAddress = (address: string) => {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
      <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
        <div>
          <h2 className="text-base font-medium">Transaction History</h2>
          <p className="text-sm text-gray-500">Recent transfers</p>
        </div>
        <div className="flex flex-col gap-2 relative max-h-[180px] overflow-hidden">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No transactions yet
            </p>
          ) : (
            <>
              {transactions.slice(0, 3).map((tx) => (
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
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === "success"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
              {transactions.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

TransactionHistory.displayName = "TransactionHistory";
