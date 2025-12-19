import { Connection, PublicKey } from '@solana/web3.js';
import { TestRelayer } from '../utils/validator.js';
import { createAndFundWallet, createTestToken, fundTokenAccount } from '../utils/setup.js';
import { expect } from 'chai';

describe('Basic Integration Scenario', () => {
  let relayer: TestRelayer;
  let connection: Connection;

  before(async () => {
    relayer = new TestRelayer();
    await relayer.start();
    connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  });

  after(async () => {
    await relayer.stop();
  });

  it('Successfully initializes a test environment with tokens', async () => {
    // 1. Setup a user
    const alice = await createAndFundWallet(connection, 2);
    const balance = await connection.getBalance(alice.publicKey);
    expect(balance).to.be.at.least(2 * 10 ** 9);

    // 2. Create a mock protocol token (e.g., $SOLSC)
    const mint = await createTestToken(connection, alice, alice.publicKey);
    
    // 3. Fund Alice with some tokens
    const aliceAta = await fundTokenAccount(
      connection,
      alice,
      mint,
      alice.publicKey,
      1000_000_000 // 1 token
    );

    const tokenBalance = await connection.getTokenAccountBalance(aliceAta);
    expect(tokenBalance.value.amount).to.equal('1000000000');
    
    console.log('Alice address:', alice.publicKey.toBase58());
    console.log('Mint address:', mint.toBase58());
  });
});
