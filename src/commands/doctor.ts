import { Command } from 'commander';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

interface Tool {
  name: string;
  command: string;
  installUrl: string;
  installCommand?: string;
  requiredVersion?: string;
  optional?: boolean;
}

export const doctorCommand = new Command('doctor')
  .description('Check if all required tools are installed and help fix issues')
  .option('--fix', 'Interactively fix missing dependencies')
  .action(async (options) => {
    const spinner = ora('Checking system dependencies...').start();
    
    const tools: Tool[] = [
      { 
        name: 'Node.js', 
        command: 'node --version', 
        installUrl: 'https://nodejs.org/',
        requiredVersion: '>=16.0.0' 
      },
      { 
        name: 'npm', 
        command: 'npm --version', 
        installUrl: 'https://docs.npmjs.com/downloading-and-installing-node-js-and-npm' 
      },
      { 
        name: 'Rust', 
        command: 'rustc --version', 
        installUrl: 'https://www.rust-lang.org/tools/install',
        installCommand: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
      },
      { 
        name: 'Solana CLI', 
        command: 'solana --version', 
        installUrl: 'https://docs.solana.com/cli/install-solana-cli-tools',
        installCommand: 'sh -c "$(curl -sSfL https://release.solana.com/stable/install)"'
      },
      { 
        name: 'Anchor CLI', 
        command: 'anchor --version', 
        installUrl: 'https://www.anchor-lang.com/docs/installation',
        installCommand: 'cargo install --git https://github.com/coral-xyz/anchor avm --locked && avm install latest && avm use latest'
      },
    ];

    const results: any[] = [];
    let allOk = true;

    for (const tool of tools) {
      try {
        const versionOutput = execSync(tool.command, { stdio: 'pipe' }).toString().trim();
        results.push({ ...tool, status: 'ok', version: versionOutput });
      } catch (e) {
        allOk = false;
        results.push({ ...tool, status: 'missing' });
      }
    }

    // Additional environment checks
    const envChecks = [
      {
        name: 'Solana Config',
        check: () => {
          try {
            execSync('solana config get', { stdio: 'pipe' });
            return { status: 'ok', info: 'Config found' };
          } catch {
            return { status: 'warn', info: 'No default config found' };
          }
        }
      },
      {
        name: 'Solana Keypair',
        check: () => {
          try {
            execSync('solana-keygen pubkey', { stdio: 'pipe' });
            return { status: 'ok', info: 'Default keypair found' };
          } catch {
            return { status: 'warn', info: 'No default keypair found (~/.config/solana/id.json)' };
          }
        }
      },
      {
        name: 'Local Validator',
        check: () => {
          try {
            // Check if port 8899 is listening
            if (process.platform === 'win32') {
                execSync('netstat -an | findstr 8899', { stdio: 'pipe' });
            } else {
                execSync('lsof -i :8899', { stdio: 'pipe' });
            }
            return { status: 'ok', info: 'Running' };
          } catch {
            return { status: 'info', info: 'Not running (optional for scaffolding)' };
          }
        }
      }
    ];

    const envResults = envChecks.map(c => ({ name: c.name, ...c.check() }));

    spinner.stop();

    console.log(chalk.bold('\n--- Tool Check ---'));
    results.forEach(res => {
      if (res.status === 'ok') {
        console.log(`${chalk.green('✔')} ${res.name.padEnd(15)} ${chalk.gray(res.version)}`);
      } else {
        console.log(`${chalk.red('✘')} ${res.name.padEnd(15)} ${chalk.red('Missing')}`);
      }
    });

    console.log(chalk.bold('\n--- Environment Check ---'));
    envResults.forEach(res => {
      const icon = res.status === 'ok' ? chalk.green('✔') : (res.status === 'warn' ? chalk.yellow('⚠') : chalk.blue('ℹ'));
      console.log(`${icon} ${res.name.padEnd(15)} ${chalk.gray(res.info)}`);
    });

    const missingTools = results.filter(r => r.status === 'missing');

    if (allOk) {
      console.log(chalk.green('\n✨ Your system is ready for Solana development!'));
    } else {
      console.log(chalk.yellow(`\n⚠️  ${missingTools.length} tool(s) are missing.`));
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Show installation instructions for missing tools', value: 'show' },
            { name: 'Continue anyway', value: 'skip' }
          ]
        }
      ]);

      if (action === 'show') {
        console.log(chalk.bold('\nInstallation Instructions:'));
        missingTools.forEach(tool => {
          console.log(chalk.cyan(`\n# ${tool.name}`));
          if (tool.installCommand) {
            console.log(`Run this command:\n  ${chalk.white(tool.installCommand)}`);
          }
          console.log(`Documentation: ${chalk.underline(tool.installUrl)}`);
        });
      }
    }

    const warnings = envResults.filter(r => r.status === 'warn');
    if (warnings.length > 0) {
        console.log(chalk.bold('\nTips:'));
        if (warnings.find(w => w.name === 'Solana Keypair')) {
            console.log(`- Generate a default Solana keypair: ${chalk.cyan('solana-keygen new')}`);
        }
        if (envResults.find(r => r.name === 'Local Validator' && r.status === 'info')) {
            console.log(`- Start a local validator for testing: ${chalk.cyan('solana-test-validator')}`);
        }
    }
  });
