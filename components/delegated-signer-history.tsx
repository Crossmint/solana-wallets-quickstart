"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";

interface DelegatedSigner {
  type: "solana-keypair" | "solana-fireblocks-custodial";
  address: string;
  locator: string;
  transaction?: {
    onChain: {
      transaction: string;
      lastValidBlockHeight?: number;
      txId?: string;
    };
  };
}

export function DelegatedSignerHistory({
  refreshTrigger,
}: {
  refreshTrigger?: number;
}) {
  const { wallet, type } = useWallet();
  const [signers, setSigners] = useState<DelegatedSigner[]>([]);

  useEffect(() => {
    const fetchDelegatedSigners = async () => {
      if (wallet != null && type === "solana-smart-wallet") {
        try {
          const fetchedSigners = await wallet.getDelegatedSigners();
          setSigners(fetchedSigners as DelegatedSigner[]);
        } catch (error) {
          console.error("Error fetching delegated signers:", error);
        }
      }
    };
    fetchDelegatedSigners();
  }, [wallet, type, refreshTrigger]);

  const formatAddress = (address: string) => {
    const cleanAddress = address.replace("solana-keypair:", "");
    return `${cleanAddress.slice(0, 10)}...${cleanAddress.slice(-10)}`;
  };

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-base font-medium">Delegated Signers</h2>
        <p className="text-sm text-gray-500">
          Authorized signers for your wallet
        </p>
      </div>
      <div
        className="flex flex-col gap-2 relative max-h-[180px] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {signers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No delegated signers yet
          </p>
        ) : (
          <>
            {signers.map((signer) => (
              <div
                key={signer.locator}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-xl">🔑</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatAddress(signer.locator)}
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            signer.locator.replace("solana-keypair:", "")
                          )
                        }
                        className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                        title="Copy address"
                      >
                        <Image
                          src="/copy.svg"
                          alt="Copy"
                          width={12}
                          height={12}
                        />
                      </button>
                    </span>
                    <span className="text-xs text-gray-500">
                      {signer.type === "solana-keypair"
                        ? "Keypair"
                        : "Fireblocks"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {signers.length > 3 && (
              <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
