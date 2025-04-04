import { CrossmintProviderWrapper } from "@/components/providers/crossmint-provider";
import { HomeContent } from "@/components/ui/home";

export default function Home() {
  return (
    <CrossmintProviderWrapper>
      <HomeContent />
    </CrossmintProviderWrapper>
  );
}
