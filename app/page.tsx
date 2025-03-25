import { CrossmintProviderWrapper } from "@/components/providers/crossmint-provider";
import { SampleComponent } from "@/components/sample/sample-component";

export default function Home() {
  return (
    <CrossmintProviderWrapper>
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <SampleComponent />
        {/* Add your components here */}
      </div>
    </CrossmintProviderWrapper>
  );
}
