"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

export const AppBar: FC = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Solana Staking</h1>
      <WalletMultiButton />
    </div>
  );
};
