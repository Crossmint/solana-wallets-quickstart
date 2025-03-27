"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { PopupWindow } from "@crossmint/client-sdk-window";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { ChevronDown } from "lucide-react";

export function FundWallet() {
  const { wallet } = useWallet();
  const [token, setToken] = useState<"sol" | "usdc" | null>(null);

  async function handleOnFund() {
    if (wallet == null || token == null) {
      return;
    }

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
    <Card>
      <CardHeader>
        <CardTitle>Fund wallet with test tokens</CardTitle>
        <CardDescription className="flex items-center gap-2">
          Top up wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center gap-4">
          <Label>Token</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {token || "Select token"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setToken("sol")}>
                Solana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setToken("usdc")}>
                USDC
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <Button className="w-full" onClick={handleOnFund}>
          Fund wallet
        </Button>
      </CardFooter>
    </Card>
  );
}
