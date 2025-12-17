import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import { AppBar } from '../components/AppBar';
import { StakeDashboard } from '../components/StakeDashboard';

const Home: NextPage = () => {
  return (
    <div>
      <AppBar />
      <div className="container mx-auto mt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">Solana Staking dApp</h1>
        </div>
        <StakeDashboard />
      </div>
    </div>
  );
};

export default Home;
