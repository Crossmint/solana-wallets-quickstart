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
    try {
      switch (token) {
        case "sol":
          await PopupWindow.init("https://faucet.solana.com", {
            awaitToLoad: false,
            crossOrigin: true,
            width: 550,
            height: 700,
          });
          break;
        case "usdc":
          await PopupWindow.init("https://faucet.circle.com", {
            awaitToLoad: false,
            crossOrigin: true,
            width: 550,
            height: 700,
          });
          break;
      }
    } catch (err) {
      console.error("Error funding wallet " + token + " - " + err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/sol.svg" alt="Solana" width={24} height={24} />
          <p className="font-medium">Solana</p>
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
          onClick={() => handleOnFund("sol")}
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get free test SOL
        </button>
        <button
          onClick={() => handleOnFund("usdc")}
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get 10 free test USDC
        </button>
      </div>
    </div>
  );
}
