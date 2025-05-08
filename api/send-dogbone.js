import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import bs58 from 'bs58';

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const TOKEN_MINT_ADDRESS = "5dafyUzqfQPVT8GfsU4EjaaP66cY4dASsLFeTfNwEL5f";
const PRIVATE_KEY = process.env.DOGBONE_PRIVATE_KEY;
const senderKeypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send({ message: "Only POST allowed" });

  try {
    const { wallet, amount } = req.body;
    const recipient = new PublicKey(wallet);
    const mint = new PublicKey(TOKEN_MINT_ADDRESS);

    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      mint,
      senderKeypair.publicKey
    );

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      mint,
      recipient
    );

    const signature = await transfer(
      connection,
      senderKeypair,
      senderTokenAccount.address,
      recipientTokenAccount.address,
      senderKeypair.publicKey,
      amount
    );

    res.status(200).json({ message: `Sent ${amount} $DOGBONE! Tx: ${signature}` });
  } catch (e) {
    console.error("Token send error:", e);
    res.status(500).json({ message: "Error sending token" });
  }
}
