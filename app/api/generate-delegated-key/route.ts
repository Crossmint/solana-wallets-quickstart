import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
export async function POST() {
  try {
    const keypair = Keypair.generate();

    return NextResponse.json({
      success: true,
      address: keypair.publicKey.toString(),
      secretKey: Array.from(keypair.secretKey),
    });
  } catch (error) {
    console.error("Failed to generate keypair:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate keypair" },
      { status: 500 }
    );
  }
}
