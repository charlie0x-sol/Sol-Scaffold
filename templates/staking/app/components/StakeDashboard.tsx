"use client";

import { FC, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey("<%= programId %>");

export const StakeDashboard: FC = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const handleInitStake = async () => {
    if (!wallet) return;
    console.log("Initializing Stake Account");
    // await program.methods.initStake()...
  };

  const handleStake = async () => {
    if (!wallet) return;
    console.log("Staking:", stakeAmount);
    // await program.methods.stake(new BN(stakeAmount))...
  };

  const handleUnstake = async () => {
    if (!wallet) return;
    console.log("Unstaking:", unstakeAmount);
    // await program.methods.unstake(new BN(unstakeAmount))...
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-black">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <button onClick={handleInitStake} className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700">
          Initialize Stake Account (First Time Only)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Stake Tokens</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount to Stake</label>
          <input 
            type="number" 
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <button onClick={handleStake} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
          Stake
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Unstake & Claim</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount to Unstake</label>
          <input 
            type="number" 
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <button onClick={handleUnstake} className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700">
          Unstake
        </button>
      </div>
    </div>
  );
};
