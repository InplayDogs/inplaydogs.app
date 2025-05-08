// File: src/App.jsx

import React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import BuyDogbone from "./BuyDogbone";
import "@solana/wallet-adapter-react-ui/styles.css";

const wallets = [new PhantomWalletAdapter()];

const App = () => {
  return (
    <ConnectionProvider endpoint={clusterApiUrl("mainnet-beta")}> 
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Buy $DOGBONE</h1>
            <WalletMultiButton className="mb-4" />
            <BuyDogbone />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;

// File: src/BuyDogbone.jsx

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const BuyDogbone = () => {
  const { publicKey, connected } = useWallet();

  const handleBuy = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your Phantom wallet first.");
      return;
    }

    try {
      const response = await fetch("/api/send-dogbone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString(), amount: 100 }),
      });
      const result = await response.json();
      alert(result.message || "Token sent!");
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  return (
    <>
      {connected && (
        <button 
          onClick={handleBuy} 
          className="bg-blue-600 text-white px-4 py-2 rounded shadow">
          Buy 100 $DOGBONE
        </button>
      )}
    </>
  );
};

export default BuyDogbone;

// File: api/send-dogbone.js

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import bs58 from 'bs58';

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// Replace with your real $DOGBONE mint address
const TOKEN_MINT_ADDRESS = "5dafyUzqfQPVT8GfsU4EjaaP66cY4dASsLFeTfNwEL5f";

// Replace with your real private key (in JSON format or environment-secured)
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
