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
  const { wallet } = useWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image src="/sol.svg" alt="Solana" width={24} height={24} />
          Create a wallet
        </CardTitle>
        <CardDescription>Create a wallet to start using Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {wallet != null && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 w-full break-all">
                  {wallet?.getAddress()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet?.getAddress() || "");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
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
