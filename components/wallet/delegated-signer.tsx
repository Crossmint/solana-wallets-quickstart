"use client";

import { useEffect, useState } from "react";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { useDelegatedSignerKeypair } from "@/app/hooks/useDelegatedSignerKeypair";
import { AuthenticatedCardContent } from "../ui/crossmint/auth-card-content";

export function DelegatedSigner() {
  const { user } = useAuth();
  const { wallet, type } = useWallet();
  const [delegateAddressInput, setDelegateAddressInput] = useState("");
  const { clearKeypair, delegatedSignerPubkey, generateKeypair } =
    useDelegatedSignerKeypair();

  useEffect(() => {
    const fetchTransactions = async () => {
      const txns = await wallet?.transactions();
      console.log({ txns });
    };
    fetchTransactions();
  }, [wallet]);

  useEffect(() => {
    if (delegatedSignerPubkey) {
      setDelegateAddressInput(delegatedSignerPubkey);
    }
  }, [delegatedSignerPubkey]);

  console.log({ wallet, user });

  const handleDelegateKey = async () => {
    if (type !== "solana-smart-wallet" || !delegatedSignerPubkey) {
      return;
    }

    try {
      const response = await wallet.addDelegatedSigner(delegatedSignerPubkey);
      console.log({ response });
    } catch (err) {
      console.error("Something went wrong ", err);
    }
  };

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Delegated Signer</CardTitle>
        <CardDescription>
          Create a delegated signer for your wallet
        </CardDescription>
      </CardHeader>
      <AuthenticatedCardContent className="space-y-4">
        {delegatedSignerPubkey != null ? (
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded-md text-xs">
            <p className="font-semibold">
              You have already generated a keypair.{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={clearKeypair}
              >
                Remove it
              </Button>
            </p>
            <p className="text-yellow-700 text-[11px] truncate">
              {delegatedSignerPubkey}
            </p>
          </div>
        ) : (
          <Button onClick={generateKeypair}>1. Generate Keypair</Button>
        )}
        {delegatedSignerPubkey != null && (
          <>
            <div className="flex flex-col gap-2 w-full">
              <Label>Delegate Address</Label>
              <Input
                placeholder="Enter delegate wallet address"
                value={delegateAddressInput}
                onChange={(e) => setDelegateAddressInput(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleDelegateKey}
              disabled={!delegateAddressInput}
            >
              Create Delegate Signer
            </Button>
          </>
        )}
      </AuthenticatedCardContent>
    </Card>
  );
}
