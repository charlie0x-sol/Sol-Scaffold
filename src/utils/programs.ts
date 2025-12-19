import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

export interface KnownProgram {
  name: string;
  programId: string;
  description: string;
}

export const KNOWN_PROGRAMS: Record<string, KnownProgram> = {
  serum: {
    name: 'OpenBook/Serum DEX',
    programId: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
    description: 'Central Limit Order Book'
  },
  pyth: {
    name: 'Pyth Oracle',
    programId: 'FsJ3A3u2vn5cTVofAjvy6y5triRuEXnhnsCkQ4vDDN',
    description: 'Real-time market data'
  },
  raydium: {
    name: 'Raydium V4',
    programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    description: 'AMM Liquidity Pool'
  },
  metaplex: {
    name: 'Metaplex Token Metadata',
    programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    description: 'NFT Metadata Standard'
  }
};

export function checkSolanaCli(): boolean {
  try {
    execSync('solana --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

export function dumpProgram(
  programKey: string, 
  destDir: string, 
  rpcUrl: string
): boolean {
  const program = KNOWN_PROGRAMS[programKey];
  if (!program) {
    console.warn(chalk.yellow(`Unknown program key: ${programKey}`));
    return false;
  }

  const spinner = ora(`Dumping ${program.name} (${program.programId})...`).start();

  try {
    const destPath = path.join(destDir, `${program.programId}.so`);
    
    // Check if solana is installed
    if (!checkSolanaCli()) {
      spinner.fail('Solana CLI is not installed. Cannot dump program.');
      return false;
    }

    execSync(`solana program dump -u ${rpcUrl} ${program.programId} ${destPath}`, { stdio: 'ignore' });
    
    spinner.succeed(`Dumped ${program.name} to ${path.basename(destPath)}`);
    return true;
  } catch (e) {
    spinner.fail(`Failed to dump ${program.name}.`);
    if (e instanceof Error) {
        // Only show detailed error if it's not the standard "command failed" noise
        // console.error(chalk.gray(e.message));
    }
    return false;
  }
}
