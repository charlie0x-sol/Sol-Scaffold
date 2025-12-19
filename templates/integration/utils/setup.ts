import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

export async function airdrop(
  connection: Connection,
  address: PublicKey,
  amount = 10
): Promise<void> {
  const signature = await connection.requestAirdrop(
    address,
    amount * LAMPORTS_PER_SOL
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  });
}

export async function createAndFundWallet(
  connection: Connection,
  amount = 10
): Promise<Keypair> {
  const wallet = Keypair.generate();
  await airdrop(connection, wallet.publicKey, amount);
  return wallet;
}

export async function createTestToken(
  connection: Connection,
  payer: Keypair,
  authority: PublicKey,
  decimals = 9
): Promise<PublicKey> {
  return await createMint(
    connection,
    payer,
    authority,
    null,
    decimals
  );
}

export async function fundTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  amount: number
): Promise<PublicKey> {
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );
  
  await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    amount
  );

  return ata.address;
}

/**
 * Robust helper to wait for a transaction to be confirmed
 */
export async function confirmTx(
  connection: Connection,
  signature: string
): Promise<void> {
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  });
}
