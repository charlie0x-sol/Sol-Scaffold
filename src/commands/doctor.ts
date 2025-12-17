import { Command } from 'commander';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

export const doctorCommand = new Command('doctor')
  .description('Check if all required tools are installed')
  .action(async () => {
    const spinner = ora('Checking system dependencies...').start();
    const tools = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
      { name: 'Solana CLI', command: 'solana --version' },
      { name: 'Anchor CLI', command: 'anchor --version' },
      { name: 'Rust', command: 'rustc --version' },
      { name: 'Cargo', command: 'cargo --version' },
    ];

    let allOk = true;
    const results = [];

    for (const tool of tools) {
      try {
        const version = execSync(tool.command, { stdio: 'pipe' }).toString().trim();
        results.push({ name: tool.name, status: 'ok', version });
      } catch (e) {
        allOk = false;
        results.push({ name: tool.name, status: 'missing' });
      }
    }

    spinner.stop();

    console.log(chalk.bold('\nSystem Check:'));
    results.forEach(res => {
      if (res.status === 'ok') {
        console.log(`${chalk.green('✔')} ${res.name}: ${chalk.gray(res.version)}`);
      } else {
        console.log(`${chalk.red('✘')} ${res.name}: ${chalk.red('Missing')}`);
      }
    });

    if (allOk) {
      console.log(chalk.green('\nYour system is ready for Solana development!'));
    } else {
      console.log(chalk.yellow('\nSome tools are missing. Please install them to ensure everything works correctly.'));
    }
  });
