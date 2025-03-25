import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="py-5 relative z-20 bg-background">
      <div className="flex flex-col md:flex-row items-center justify-between lg:px-6 px-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="text-green-500">
            <Image
              src="/crossmint.png"
              alt="Crossmint logo"
              width={32}
              height={32}
            />
          </div>
          <div>
            <h1 className="text-xl font-medium">{siteConfig.title}</h1>
            <p className="text-sm text-gray-500">{siteConfig.description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
