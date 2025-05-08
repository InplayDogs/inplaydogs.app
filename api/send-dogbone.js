// /api/send-dogbone.js

import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import bs58 from 'bs58';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  try {
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
      return res.status(400).json({ error: 'Recipient and amount are required' });
    }

    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    const secretKey = bs58.decode(process.env.DOGBONE_PRIVATE_KEY);
    const fromWallet = Keypair.fromSecretKey(secretKey);

    const DOGBONE_MINT = new PublicKey('5dafyUzqfQPVT8GfsU4EjaaP66cY4dASsLFeTfNwEL5f');
    const toPublicKey = new PublicKey(recipient);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      DOGBONE_MINT,
      fromWallet.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      DOGBONE_MINT,
      toPublicKey
    );

    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet,
      Number(amount) * 10 ** 8 // Using 8 decimals
    );

    return res.status(200).json({ message: 'Transfer successful', signature });
  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({ error: 'Transfer failed', details: error.message });
  }
}
