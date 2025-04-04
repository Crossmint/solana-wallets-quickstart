"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { PopupWindow } from "@crossmint/client-sdk-window";

export function WalletBalance() {
  const { wallet, type } = useWallet();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBalances() {
      if (!wallet || type !== "solana-smart-wallet") return;
      try {
        const balances = (await wallet.balances(["sol", "usdc"])) as any[];
        setData(balances || []);
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
      }
    }
    fetchBalances();
  }, [wallet, type]);

  const formatBalance = (balance: string, decimals: number) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
  };

  const solBalance =
    data?.find((t) => t.token === "sol")?.balances.total || "0";
  const usdcBalance =
    data?.find((t) => t.token === "usdc")?.balances.total || "0";

  async function handleOnFund(token: "sol" | "usdc") {
    await PopupWindow.init(
      token === "sol"
        ? "https://faucet.solana.com/"
        : "https://faucet.circle.com/",
      {
        awaitToLoad: false,
        crossOrigin: true,
        width: 550,
        height: 700,
      }
    );
  }

  return (
    <div className="bg-white flex flex-col rounded-xl border shadow-sm">
      <div className="p-5 pb-0">
        <h2 className="text-lg font-medium">Wallet balance</h2>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/usdc.png" alt="USDC" width={24} height={24} />
              <p>USDC</p>
            </div>
            <div className="text-gray-600">
              $ {formatBalance(usdcBalance, 6)}
            </div>
          </div>
          <div className="border-t my-2"></div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/sol.svg" alt="Solana" width={24} height={24} />
              <p>Solana</p>
              <button
                className="text-xs text-accent hover:underline"
                onClick={() => handleOnFund("sol")}
              >
                Fund
              </button>
            </div>
            <div className="text-gray-600">
              {formatBalance(solBalance, 9)} SOL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
