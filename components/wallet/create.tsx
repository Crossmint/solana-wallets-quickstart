"use client";

import * as React from "react";
import Image from "next/image";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy } from "lucide-react";

export function CreateWallet() {
  const { logout, login } = useAuth();
  const { wallet, status } = useWallet();

  // @ts-expect-error wallet isn't typed correctly for this new field
  const externalWalletAddress = wallet?.adminSigner?.address;
  const crossmintWalletAddress = wallet?.getAddress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Create a Solana Smart Wallet
        </CardTitle>
        <CardDescription>
          Connect your external wallet to start using Solana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {wallet != null && (
            <div className="flex flex-col gap-1 p-1.5 rounded-lg border">
              <div className="flex items-center gap-2">
                <Image
                  src="/crossmint.png"
                  alt="Crossmint"
                  width={20}
                  height={20}
                />
                <div className="overflow-hidden flex-grow">
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground truncate">
                      {crossmintWalletAddress}
                    </p>
                    <Button
                      className="w-4 h-4"
                      variant={"ghost"}
                      onClick={() =>
                        navigator.clipboard.writeText(
                          crossmintWalletAddress ?? ""
                        )
                      }
                    >
                      <Copy className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                This is your Crossmint wallet address.
              </p>
            </div>
          )}
          {externalWalletAddress != null && (
            <div className="flex flex-col gap-1 p-1.5 rounded-lg border">
              <div className="flex items-center gap-2">
                <Image src="/sol.svg" alt="Solana" width={20} height={20} />
                <div className="overflow-hidden flex-grow">
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground truncate">
                      {externalWalletAddress}
                    </p>
                    <Button
                      className="w-4 h-4"
                      variant={"ghost"}
                      onClick={() =>
                        navigator.clipboard.writeText(externalWalletAddress)
                      }
                    >
                      <Copy className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                This is your external wallet address.
              </p>
            </div>
          )}
          {status === "loaded" && (
            <div className="p-2 bg-green-100 border border-green-300 rounded-md text-xs">
              Crossmint wallet fetched successfully with your external wallet as
              the primary signer.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="w-full"
          variant={"outline"}
          onClick={wallet != null ? logout : login}
        >
          {wallet != null ? "Log out" : "Log in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
