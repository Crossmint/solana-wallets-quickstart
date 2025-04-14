"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";

type WalletDemoBalances = {
  token: "sol" | "usdc";
  decimals: number;
  balances: {
    total: string;
  };
}[];

interface BalanceContextType {
  balances: WalletDemoBalances;
  formatBalance: (balance: string, decimals: number) => string;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { wallet, type } = useWallet();
  const [balances, setBalances] = useState<WalletDemoBalances>([]);

  const getTokenBalance = useCallback(
    async (token: string, balances: WalletDemoBalances) => {
      return balances.find((t) => t.token === token)?.balances.total;
    },
    []
  );

  const fetchBalances = useCallback(async () => {
    if (!wallet || type !== "solana-smart-wallet") return;
    try {
      const fetchedBalances = (await wallet.getBalances([
        "sol",
        "usdc",
      ])) as WalletDemoBalances;
      const currentSolBalance = await getTokenBalance("sol", balances);
      const currentUsdcBalance = await getTokenBalance("usdc", balances);
      const newSolBalance = await getTokenBalance("sol", fetchedBalances);
      const newUsdcBalance = await getTokenBalance("usdc", fetchedBalances);

      if (
        newSolBalance !== currentSolBalance ||
        newUsdcBalance !== currentUsdcBalance
      ) {
        setBalances(fetchedBalances || []);
      }
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    }
  }, [wallet, type, getTokenBalance, balances]);

  useEffect(() => {
    fetchBalances();

    // Set up interval to refresh balances every 5 seconds
    const intervalId = setInterval(fetchBalances, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchBalances]);

  const formatBalance = (balance: string, decimals: number) => {
    return (Number(balance) / 10 ** decimals).toFixed(2);
  };

  return (
    <BalanceContext.Provider value={{ balances, formatBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
