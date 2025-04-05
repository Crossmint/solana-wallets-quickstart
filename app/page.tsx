import Image from "next/image";
import { HomeContent } from "@/app/home";

export default function Home() {
  return (
    <div className="grid grid-rows-[0px_1fr_60px] items-center justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <HomeContent />
      </main>
      <footer className="row-start-3 flex flex-col gap-4 items-center justify-center">
        <div className="flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/crossmint/solana-smart-wallet-quickstart"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            View code
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/crossmint"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            See all quickstarts
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://crossmint.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to crossmint.com →
          </a>
        </div>
        <div className="flex">
          <Image
            src="/crossmint-leaf.svg"
            alt="Powered by Crossmint"
            priority
            width={152}
            height={100}
          />
        </div>
      </footer>
    </div>
  );

  return (
    <div className="mx-auto h-screen flex flex-col">
      {/* <HomeContent /> */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="flex w-full items-center md:justify-center gap-4 md:gap-12 flex-col md:flex-row">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/Crossmint/solana-smart-wallet-quickstart"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/file.svg" alt="GitHub" width={20} height={20} />
            View code
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/crossmint"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/window.svg" alt="GitHub" width={20} height={20} />
            See all quickstarts
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/globe.svg" alt="GitHub" width={20} height={20} />
            Go to Crossmint.com
          </a>
        </div>
        <div className="flex">
          <Image
            src="/crossmint-leaf.svg"
            alt="Powered by Crossmint"
            width={152}
            height={100}
          />
        </div>
      </footer>
    </div>
  );
}
