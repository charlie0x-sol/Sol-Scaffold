import { AppBar } from '../components/AppBar';
import { Dashboard } from '../components/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <AppBar />
      <div className="flex flex-col justify-center items-center py-10">
        <Dashboard />
      </div>
    </main>
  );
}
