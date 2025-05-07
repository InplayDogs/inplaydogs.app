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
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Buy 100 $DOGBONE
        </button>
      )}
    </>
  );
};

export default BuyDogbone;