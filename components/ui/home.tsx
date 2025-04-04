"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import {
  CreateWallet,
  DelegatedSigner,
  TransferFunds,
  WalletBalance,
} from "../wallet";
import { cn } from "@/lib/utils";

export function HomeContent() {
  const { wallet, status: walletStatus } = useWallet();
  const { status, status: authStatus } = useAuth();
  const isLoggedIn = wallet != null && status === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <img
          src="/crossmint.png"
          alt="Crossmint Logo"
          className="mr-3 size-5 animate-spin"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-7xl mx-auto p-4",
        !isLoggedIn ? "flex justify-center items-center min-h-[80vh]" : ""
      )}
    >
      {isLoggedIn ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreateWallet />
          <WalletBalance />
          <TransferFunds />
          <DelegatedSigner />
        </div>
      ) : (
        <div className="max-w-md w-full">
          <CreateWallet />
        </div>
      )}
    </div>
  );
}
