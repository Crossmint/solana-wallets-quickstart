import { CrossmintProviderWrapper } from "@/components/providers/crossmint-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  CreateWallet,
  FundWallet,
  TransferFunds,
  WalletBalance,
} from "@/components/wallet";

export default function Home() {
  return (
    <QueryProvider>
      <CrossmintProviderWrapper>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <CreateWallet />
          <WalletBalance />
          <FundWallet />
          <TransferFunds />
        </div>
      </CrossmintProviderWrapper>
    </QueryProvider>
  );
}
