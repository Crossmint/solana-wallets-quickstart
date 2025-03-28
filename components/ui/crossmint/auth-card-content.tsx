"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";
import { CardContent } from "../card";
import { Lock } from "lucide-react";

interface AuthenticatedCardContentProps
  extends React.ComponentProps<typeof CardContent> {
  children: React.ReactNode;
  loadingClassName?: string;
}

export function AuthenticatedCardContent({
  children,
  className,
  loadingClassName,
  ...props
}: AuthenticatedCardContentProps) {
  const { wallet } = useWallet();
  const { status: authStatus } = useAuth();

  if (wallet == null && authStatus !== "in-progress") {
    return (
      <CardContent
        className={cn(
          "relative min-h-[112px] overflow-hidden bg-gradient-to-r from-gray-100 to-gray-100",
          "before:absolute before:inset-0",
          "before:bg-[length:10px_10px]",
          "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]",
          loadingClassName
        )}
        {...props}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Log in to unlock</span>
          </div>
        </div>
        <div
          className="opacity-25"
          aria-hidden="true"
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => e.preventDefault()}
          tabIndex={-1}
          style={{ pointerEvents: "none" }}
        >
          {children}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className={className} {...props}>
      {children}
    </CardContent>
  );
}
