import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import { AppBar } from '../components/AppBar';
import { Dashboard } from '../components/Dashboard';

const Home: NextPage = () => {
  return (
    <div>
      <AppBar />
      <div className="container mx-auto mt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">Solana Lending dApp</h1>
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

export default Home;
