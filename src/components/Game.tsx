import React, { useState } from 'react';
import axios from "axios";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { Coins as Coin, PinOff as CoinOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORM_FEE = 0.03; // 3%
const PLATFORM_WALLET = new PublicKey('6fQytE8KQZvEVvGnSM6kfWbtVbso8j3GhFQPuZoHZCmD'); // Replace with your platform wallet
const BACKEND_URL = "http://localhost:3000"

const Game = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [amount, setAmount] = useState<number>(0.1);
  const [isFlipping, setIsFlipping] = useState(false);

  const amounts = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

  const handleBet = async () => {
    if (!publicKey || !selectedSide) return;

    try {
      setIsFlipping(true);
      
      // Calculate amounts in lamports
      const betAmount = amount * LAMPORTS_PER_SOL;
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: Math.floor(betAmount),
        })
      );

      // Send initial transaction with platform fee
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Simulate coin flip
      // const result = Math.random() >= 0.5 ? 'heads' : 'tails';
      
      const response = await axios.post(`${BACKEND_URL}/flip`, {
        signature,
        betAmount
      })

      const won = response.data.won;
      if (won) {
        toast.success('Congratulations! You won!');
      } else {
        toast.error('Better luck next time!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Transaction failed!');
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-8 shadow-lg">
      {!publicKey ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Choose Your Side</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSelectedSide('heads')}
                className={`p-4 rounded-lg ${
                  selectedSide === 'heads'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Coin className="w-12 h-12" />
                <span className="block mt-2">Heads</span>
              </button>
              <button
                onClick={() => setSelectedSide('tails')}
                className={`p-4 rounded-lg ${
                  selectedSide === 'tails'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <CoinOff className="w-12 h-12" />
                <span className="block mt-2">Tails</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Select Amount</h3>
            <div className="grid grid-cols-3 gap-2">
              {amounts.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 px-4 rounded ${
                    amount === val
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {val} SOL
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBet}
            disabled={!selectedSide || isFlipping}
            className={`w-full py-3 px-6 rounded-lg text-lg font-semibold ${
              !selectedSide || isFlipping
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isFlipping ? 'Flipping...' : 'Place Bet'}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Platform fee: {PLATFORM_FEE * 100}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Game;