import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

export const AppBar: FC = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Solana Swap</h1>
      <WalletMultiButton />
    </div>
  );
};
