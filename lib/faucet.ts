import { Connection, LAMPORTS_PER_SOL, type PublicKey } from "@solana/web3.js";

export async function airdropUsingConnection(walletPubKey: PublicKey) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
  );
  await connection.requestAirdrop(walletPubKey, LAMPORTS_PER_SOL);
}
