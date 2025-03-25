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

// Note: this component is a sample component that's used as a template for creating new components.
export function SampleComponent() {
  const { logout, login } = useAuth();
  const { getOrCreateWallet, wallet } = useWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image src="/sol.svg" alt="Solana" width={24} height={24} />
          EXAMPLE COMPONENT
        </CardTitle>
        <CardDescription>Create a wallet to start using Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            {wallet != null && (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 truncate">{wallet?.getAddress()}</div>
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
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={wallet != null ? "destructive" : "default"}
          onClick={wallet != null ? logout : login}
        >
          {wallet != null ? "Logout" : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
}
