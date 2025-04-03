"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
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
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  createSolTransferTransaction,
  createTokenTransferTransaction,
} from "@/lib/transaction/createTransaction";

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [token, setToken] = useState<"sol" | "usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const validateSolanaAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipient(address);
    // Clear any error when the user types
    if (addressError) {
      setAddressError(null);
    }
  };

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

    if (recipient && !validateSolanaAddress(recipient)) {
      setAddressError("Invalid Solana address");
      return;
    }

    try {
      setIsLoading(true);
      const buildTransaction = async () => {
        if (token === "sol") {
          return createSolTransferTransaction(
            wallet.getAddress(),
            recipient,
            amount
          );
        }
        const tokenMint =
          token === "usdc"
            ? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
            : (() => {
                throw new Error(`Invalid token: ${token}`);
              })();
        return createTokenTransferTransaction(
          wallet.getAddress(),
          recipient,
          tokenMint,
          amount
        );
      };
      const txn = await buildTransaction();

      // console.log({ txn });

      const txHash = await wallet.sendTransaction({
        transaction: txn,
      });

      console.log({ txHash });

      if (txHash) {
        const explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
        toast.success(
          <div>
            Transaction successful!{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer
            </a>
          </div>,
          {
            duration: 5000,
          }
        );
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Something went wrong", err);
      toast.error(
        <div>
          Transaction failed: {(err as Error).message || "Unknown error"}
        </div>,
        {
          duration: 5000,
        }
      );
      setIsLoading(false);
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
              onChange={handleRecipientChange}
              className={addressError ? "border-red-500" : ""}
            />
            {addressError && (
              <p className="text-red-500 text-sm mt-1">{addressError}</p>
            )}
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
        <Button
          className="w-full"
          onClick={handleOnTransfer}
          disabled={
            isLoading || !!addressError || !recipient || !token || !amount
          }
        >
          {isLoading ? "Sending..." : "Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
