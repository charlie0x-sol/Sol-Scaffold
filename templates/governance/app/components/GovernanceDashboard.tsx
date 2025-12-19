import { FC, useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// The IDL will be available after build, so we define the interface needed
const PROGRAM_ID = new PublicKey("<%= programId %>");

export const GovernanceDashboard: FC = () => {
  const [daoName, setDaoName] = useState('Loading...');
  const [proposals, setProposals] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  useEffect(() => {
    // In a real app, fetch proposals from on-chain here
    setDaoName("Community DAO");
    setProposals([
      { id: 0, title: 'Initial Liquidity', forVotes: 1000, againstVotes: 200, status: 'Active' },
      { id: 1, title: 'Upgrade Rewards', forVotes: 450, againstVotes: 50, status: 'Active' },
    ]);
  }, [wallet]);

  const handleCreateProposal = async () => {
    if (!wallet) return;
    console.log("Creating Proposal:", newTitle);
    // Logic for creating proposal via program
  };

  const handleVote = async (proposalId: number, side: boolean) => {
    if (!wallet) return;
    console.log(`Voting ${side ? 'YES' : 'NO'} on proposal ${proposalId}`);
    // Logic for voting via program
  };

  return (
    <div className="flex flex-col gap-6 p-4 text-black max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-500">
        <h1 className="text-3xl font-extrabold mb-2">{daoName}</h1>
        <p className="text-gray-600">Governance Portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Active Proposals</h2>
          {proposals.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">#{p.id}: {p.title}</h3>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">{p.status}</span>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total Votes: {p.forVotes + p.againstVotes}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${(p.forVotes / (p.forVotes + p.againstVotes)) * 100}%` }}
                ></div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleVote(p.id, true)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                  Vote YES ({p.forVotes})
                </button>
                <button 
                  onClick={() => handleVote(p.id, false)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition"
                >
                  Vote NO ({p.againstVotes})
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">New Proposal</h2>
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border h-32 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What is this proposal for?"
              ></textarea>
            </div>
            <button 
              onClick={handleCreateProposal}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
            >
              Submit Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
