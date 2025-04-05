"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { WalletBalance } from "@/components/balance";
import { TransferFunds } from "@/components/transfer";
import { DelegatedSigner } from "@/components/delegated-signer";
import { LogoutButton } from "@/components/logout";
import { LoginButton } from "@/components/login";

export function HomeContent() {
  const { wallet, status: walletStatus } = useWallet();
  const { status, status: authStatus } = useAuth();

  const isLoggedIn = wallet != null && status === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
        />
        <h1 className="text-xl font-medium">Solana Wallets Quickstart</h1>
        <div className="max-w-md mt-3 w-full min-h-[38px]">
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col mb-8">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
          className="mb-4"
        />
        <h1 className="text-2xl font-semibold mb-2">
          Solana Wallets Quickstart
        </h1>
        <p className="text-gray-600 text-sm">
          The easiest way to build onchain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white flex flex-col gap-3 justify-between rounded-xl border shadow-sm p-5 overflow-hidden">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-medium">Your wallet</h2>
              <p className="text-sm text-gray-500 truncate">
                {wallet?.getAddress()}
              </p>
            </div>
            <WalletBalance />
          </div>
          <LogoutButton />
        </div>
        <TransferFunds />
        <DelegatedSigner />
      </div>
    </div>
  );
}
