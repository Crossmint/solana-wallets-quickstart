"use client";

import * as React from "react";
import Image from "next/image";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { Copy } from "lucide-react";

export function CreateWallet() {
  const { logout, login } = useAuth();
  const { wallet } = useWallet();

  const crossmintWalletAddress = wallet?.getAddress();

  return (
    <div className="bg-white flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
      {wallet != null && (
        <div className="flex flex-col gap-2 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/sol.svg" alt="Solana" width={20} height={20} />
              <span className="text-xs font-medium">Smart Wallet</span>
            </div>
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() =>
                navigator.clipboard.writeText(crossmintWalletAddress ?? "")
              }
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-600 truncate">
            {crossmintWalletAddress}
          </p>
        </div>
      )}
      <button
        className="w-full py-2 px-4 rounded-md text-sm font-medium border bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={wallet != null ? logout : login}
      >
        {wallet != null ? "Log out" : "Connect wallet"}
      </button>
    </div>
  );
}
