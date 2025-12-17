import { AppBar } from '../components/AppBar';
import { SwapForm } from '../components/SwapForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <AppBar />
      <div className="flex flex-col justify-center items-center py-20">
        <SwapForm />
      </div>
    </main>
  );
}
