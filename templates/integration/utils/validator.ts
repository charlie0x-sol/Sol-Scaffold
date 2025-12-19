import { spawn, ChildProcess } from 'child_process';
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export interface ValidatorConfig {
  rpcPort?: number;
  faucetPort?: number;
  ledgerDir?: string;
  fixturesDir?: string;
  programs?: { programId: string; deployPath: string }[];
  accountsToClone?: string[];
  mainnetRpcUrl?: string;
}

export class TestRelayer {
  private validatorProcess: ChildProcess | null = null;
  private config: ValidatorConfig;

  constructor(config: ValidatorConfig = {}) {
    this.config = {
      rpcPort: 8899,
      faucetPort: 9900,
      ledgerDir: '.anchor/test-ledger',
      fixturesDir: 'tests/integration/fixtures',
      programs: [],
      accountsToClone: [],
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.validatorProcess) {
      throw new Error('Validator is already running');
    }

    const args = [
      '--rpc-port', this.config.rpcPort!.toString(),
      '--faucet-port', this.config.faucetPort!.toString(),
      '--ledger', this.config.ledgerDir!,
      '--reset',
    ];

    // Add programs from fixtures directory
    if (fs.existsSync(this.config.fixturesDir!)) {
      const files = fs.readdirSync(this.config.fixturesDir!);
      for (const file of files) {
        if (file.endsWith('.so')) {
          const programIdStr = file.replace('.so', '');
          try {
            // Check if filename is a valid public key
            new PublicKey(programIdStr);
            const deployPath = path.join(this.config.fixturesDir!, file);
            args.push('--bpf-program', programIdStr, deployPath);
            console.log(chalk.gray(`[TestRelayer] Auto-loading program ${programIdStr}`));
          } catch (e) {
            // Not a valid public key, ignore or handle differently
            console.log(chalk.yellow(`[TestRelayer] Skipping ${file}: filename is not a valid program ID`));
          }
        }
      }
    }

    // Add explicitly configured programs
    for (const prog of this.config.programs || []) {
      args.push('--bpf-program', prog.programId, prog.deployPath);
    }

    // Add accounts to clone from mainnet
    if (this.config.accountsToClone?.length && this.config.mainnetRpcUrl) {
      args.push('--url', this.config.mainnetRpcUrl);
      for (const account of this.config.accountsToClone) {
        args.push('--clone', account);
      }
    }

    console.log(chalk.blue(`[TestRelayer] Starting solana-test-validator...`));
    
    this.validatorProcess = spawn('solana-test-validator', args, {
      stdio: 'inherit',
      detached: true,
    });

    this.validatorProcess.on('error', (err: any) => {
      if (err.code === 'ENOENT') {
        console.error(chalk.red(`[TestRelayer] Error: 'solana-test-validator' not found in PATH.`));
        console.error(chalk.yellow(`Please install the Solana CLI tools: https://docs.solana.com/cli/install-solana-cli-tools`));
      } else {
        console.error(chalk.red(`[TestRelayer] Failed to start validator: ${err.message}`));
      }
    });

    // Wait for RPC to be available
    await this.waitForRuntime();
    console.log(chalk.green(`[TestRelayer] Validator is ready!`));
  }

  private async waitForRuntime(): Promise<void> {
    const connection = new Connection(`http://127.0.0.1:${this.config.rpcPort}`, 'confirmed');
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        await connection.getSlot();
        return;
      } catch (e) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Timeout waiting for validator to start');
  }

  async stop(): Promise<void> {
    if (this.validatorProcess) {
      console.log(chalk.blue(`[TestRelayer] Stopping validator...`));
      
      return new Promise((resolve) => {
        if (this.validatorProcess?.pid) {
          // Kill the process group since we used detached: true
          try {
            process.kill(-this.validatorProcess.pid, 'SIGKILL');
          } catch (e) {
            // Process might already be dead
          }
        }
        this.validatorProcess = null;
        resolve();
      });
    }
  }
}
