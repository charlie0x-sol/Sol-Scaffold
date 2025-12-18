import { FC, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
// In a real project, you would import the IDL here
// import idl from '../idl.json';

const PROGRAM_ID = new PublicKey("<%= programId %>");

export const SwapForm: FC = () => {
  const [amountIn, setAmountIn] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const handleSwap = async () => {
    if (!wallet) return;

    // This is where the interaction logic goes
    // const provider = new AnchorProvider(connection, wallet, {});
    // const program = new Program(idl, PROGRAM_ID, provider);
    
    // Example call (commented out until IDL is generated/imported)
    // await program.methods.swap(new BN(amountIn), new BN(0))
    //   .accounts({ ... })
    //   .rpc();
    
    console.log("Swap executed for:", amountIn);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-96 text-black">
      <h2 className="text-xl font-bold mb-4">Swap Tokens</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">From (Token A)</label>
        <input 
          type="number" 
          value={amountIn} 
          onChange={(e) => setAmountIn(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="0.00"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">To (Token B)</label>
        <input 
          type="number" 
          disabled 
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border"
          placeholder="Calculated amount..."
        />
      </div>
      <button 
        onClick={handleSwap}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Swap
      </button>
    </div>
  );
};
