"use client";

import * as React from "react";
import Image from "next/image";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AuthenticatedCardContent } from "../ui/crossmint/auth-card-content";

export function WalletBalance() {
  const { logout } = useAuth();
  const { wallet, type } = useWallet();

  const { data } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      if (!wallet || type !== "solana-smart-wallet") return [];
      return (await wallet.balances(["sol", "usdc"])) || [];
    },
    enabled: wallet != null,
  });

  const formatBalance = (balance: string, decimals: number) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
  };

  const solBalance =
    data?.find((t) => t.token === "sol")?.balances.total || "0";
  const usdcBalance =
    data?.find((t) => t.token === "usdc")?.balances.total || "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet balance</CardTitle>
        <CardDescription className="flex items-center gap-2">
          $
          {Number(formatBalance(usdcBalance, 6)) +
            Number(formatBalance(solBalance, 9))}
        </CardDescription>
      </CardHeader>
      <AuthenticatedCardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/usdc.png" alt="USDC" width={24} height={24} />
              <p>USDC</p>
            </div>
            <div className="text-muted-foreground">
              $ {formatBalance(usdcBalance, 6)}
            </div>
          </div>
          <div className="border-t my-2"></div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/sol.svg" alt="Solana" width={24} height={24} />
              <p>Solana</p>
            </div>
            <div className="text-muted-foreground">
              {formatBalance(solBalance, 9)} SOL
            </div>
          </div>
        </div>
        <CardFooter className="p-0 flex mt-4 w-full">
          {wallet != null && (
            <Button className="w-full" variant={"outline"} onClick={logout}>
              {"Log out "}
            </Button>
          )}
        </CardFooter>
      </AuthenticatedCardContent>
    </Card>
  );
}
