import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { connection, PROGRAM_ID } from "./connection";
import idl from "../idl/voken.json";

export function getProvider() {
  if (!window.solana) {
    throw new Error("Wallet not installed");
  }
  const provider = new AnchorProvider(connection, window.solana, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });
  return provider;
}

export function getProgram() {
  const provider = getProvider();
  return new Program(idl as any, provider);
}

export { PROGRAM_ID };
