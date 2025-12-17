import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import { AppBar } from '../components/AppBar';
import { SwapForm } from '../components/SwapForm';

const Home: NextPage = () => {
  return (
    <div>
      <AppBar />
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <SwapForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
