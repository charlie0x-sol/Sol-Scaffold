import { Command } from 'commander';
import { readdir } from 'fs/promises';
import chalk from 'chalk';
import { getTemplateDir } from '../utils/paths.js';

const DESCRIPTIONS: Record<string, string> = {
  swap: 'Automated Market Maker (AMM) for token swaps',
  lending: 'Collateralized lending and borrowing protocol',
  staking: 'Token staking and yield farming rewards',
  governance: 'DAO with proposals, voting, and execution',
};

export const listCommand = new Command('list')
  .description('List available DeFi primitives')
  .action(async () => {
    const templatesDir = getTemplateDir();
    const items = await readdir(templatesDir);
    
    // Filter out internal templates and tools
    const primitives = items.filter(t => !t.startsWith('_') && t !== 'integration');
    
    console.log(chalk.bold.green('\n📦 Available DeFi Blueprints:\n'));
    
    primitives.forEach(template => {
      const desc = DESCRIPTIONS[template] || 'Solana dApp Template';
      console.log(`  ${chalk.cyan(template.padEnd(15))} ${chalk.gray(desc)}`);
    });
    console.log('\nUse these with: ' + chalk.white('sol-scaffold new <primitive> <name>\n'));
  });
