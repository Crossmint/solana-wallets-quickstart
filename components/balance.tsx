"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { airdropUsingConnection } from "@/lib/faucet";
import { PublicKey } from "@solana/web3.js";

type WalletDemoBalances = {
  token: "sol" | "usdc";
  decimals: number;
  balances: {
    total: string;
  };
}[];

export function WalletBalance() {
  const { wallet, type } = useWallet();
  const [balances, setBalances] = useState<WalletDemoBalances>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      if (!wallet || type !== "solana-smart-wallet") return;
      try {
        const fetchedBalances = (await wallet.getBalances([
          "sol",
          "usdc",
        ])) as WalletDemoBalances;
        const getTokenBalance = async (
          token: string,
          balances: WalletDemoBalances
        ) => {
          return balances.find((t) => t.token === token)?.balances.total;
        };
        if (
          getTokenBalance("sol", fetchedBalances) !==
            getTokenBalance("sol", balances) ||
          getTokenBalance("usdc", fetchedBalances) !==
            getTokenBalance("usdc", balances)
        ) {
          setBalances(fetchedBalances || []);
        }
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
      }
    }
    fetchBalances();

    // Set up interval to refresh balances every 5 seconds
    const intervalId = setInterval(fetchBalances, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [wallet, type]);

  const handleAirdrop = async () => {
    if (!wallet?.address) return;

    setIsAirdropping(true);
    try {
      await airdropUsingConnection(new PublicKey(wallet.address));
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      window.open("https://faucet.solana.com", "_blank");
    } finally {
      setIsAirdropping(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    return (Number(balance) / 10 ** decimals).toFixed(2);
  };

  const solBalance =
    balances?.find((t) => t.token === "sol")?.balances.total || "0";
  const usdcBalance =
    balances?.find((t) => t.token === "usdc")?.balances.total || "0";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/sol.svg" alt="SOL" width={24} height={24} />
          <p className="font-medium">SOL</p>
        </div>
        <div className="text-gray-700 font-medium">
          {formatBalance(solBalance, 9)} SOL
        </div>
      </div>
      <div className="border-t my-1"></div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
          <p className="font-medium">USDC</p>
        </div>
        <div className="text-gray-700 font-medium">
          $ {formatBalance(usdcBalance, 6)}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={handleAirdrop}
          disabled={isAirdropping}
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAirdropping ? "Processing..." : "+ Get free test SOL"}
        </button>
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get free test USDC
        </a>
      </div>
      <div className="text-gray-500 text-xs">
        Balance may take a few seconds to update.
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 border border-green-100">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-center text-gray-700 font-medium">Success! 🎉</p>
            <p className="text-center text-gray-600 text-sm mt-1">
              1 devnet SOL has been sent to your wallet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
