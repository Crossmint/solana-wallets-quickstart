"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { ChevronDown } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
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
import {
  createSolTransferTransaction,
  createTokenTransferTransaction,
} from "@/lib/transaction/createTransaction";
import { AuthenticatedCard } from "../ui/crossmint/auth-card";

const isSolanaAddressValid = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [token, setToken] = useState<"sol" | "usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);

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

    // Validate Solana recipient address
    if (token === "sol" && !isSolanaAddressValid(recipient)) {
      alert("Invalid Solana recipient address");
      return;
    }

    try {
      setIsLoading(true);
      const crossmintWalletAddress = wallet.getAddress();
      function buildTransaction() {
        return token === "sol"
          ? createSolTransferTransaction(
              crossmintWalletAddress,
              recipient as string,
              amount as number
            )
          : createTokenTransferTransaction(
              crossmintWalletAddress,
              recipient as string,
              "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC token mint
              amount as number
            );
      }

      const txn = await buildTransaction();
      const txnHash = await wallet.sendTransaction({
        transaction: txn,
      });

      setTxnHash(`https://solscan.io/tx/${txnHash}?cluster=devnet`);
    } catch (err) {
      console.error("Something went wrong", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthenticatedCard>
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
                    SOL
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
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full"
            onClick={handleOnTransfer}
            disabled={isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
          {txnHash && (
            <a
              href={txnHash}
              className="text-sm text-muted-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Solscan.io
            </a>
          )}
        </div>
      </CardFooter>
    </AuthenticatedCard>
  );
}
