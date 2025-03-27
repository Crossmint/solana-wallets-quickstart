"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
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
import { Input } from "../ui/input";
import { ChevronDown } from "lucide-react";
import { createTokenTransferTransaction } from "@/lib/transaction/createTransaction";

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [token, setToken] = useState<"sol" | "usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  async function handleOnTransfer() {
    if (
      wallet == null ||
      token == null ||
      type !== "solana-smart-wallet" ||
      recipient == null ||
      amount == null
    ) {
      return;
    }

    try {
      const tokenMint =
        token === "sol"
          ? "not_supported_yet"
          : "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
      const txn = await createTokenTransferTransaction(
        wallet.getAddress(),
        recipient,
        tokenMint,
        amount
      );
      console.log({ txn });

      const response = await wallet.sendTransaction({
        transaction: txn,
      });

      console.log({ response });
    } catch (err) {
      console.error("Something went wrong", err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer funds</CardTitle>
        <CardDescription className="flex items-center gap-2">
          Send funds to another wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <Label className="self-start">Recipient wallet</Label>
            <Input
              type="text"
              placeholder="Enter wallet address"
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-full">
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
            <div className="flex flex-col gap-2 w-full">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <Button className="w-full" onClick={handleOnTransfer}>
          Transfer
        </Button>
      </CardFooter>
    </Card>
  );
}
