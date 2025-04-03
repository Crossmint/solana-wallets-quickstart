"use client";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { Card, CardContent } from "../card";

export function AuthenticatedCard({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  const { status } = useAuth();
  const { wallet } = useWallet();

  if (wallet == null || status !== "logged-in") {
    return null;
  }

  return (
    <Card className={className} {...props}>
      {children}
    </Card>
  );
}
