"use client";

import { useState } from "react";
import { useAuth } from "@crossmint/client-sdk-react-ui";
import { Toast } from "./toast";

export function LoginButton() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }
  };

  return (
    <>
      <button
        type="button"
        className="w-full py-2 px-4 rounded-md text-sm font-medium border bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={handleLogin}
      >
        Connect wallet
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Note: If you've created a wallet before in this same app, please ensure
        you're using the same browser wallet for authentication.
      </p>
      {error && <Toast message={error} />}
    </>
  );
}
