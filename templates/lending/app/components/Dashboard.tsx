import { FC, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey("<%= programId %>");

export const Dashboard: FC = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const handleInitUser = async () => {
    if (!wallet) return;
    console.log("Initializing User Account");
    // await program.methods.initUser()...
  };

  const handleDeposit = async () => {
    if (!wallet) return;
    console.log("Deposit:", depositAmount);
    // await program.methods.deposit(new BN(depositAmount))...
  };

  const handleBorrow = async () => {
    if (!wallet) return;
    console.log("Borrow:", borrowAmount);
    // await program.methods.borrow(new BN(borrowAmount))...
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-black">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <button onClick={handleInitUser} className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
          Initialize Account (First Time Only)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Supply Market</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input 
            type="number" 
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <button onClick={handleDeposit} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
          Deposit
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Borrow Market</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input 
            type="number" 
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <button onClick={handleBorrow} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Borrow
        </button>
      </div>
    </div>
  );
};
