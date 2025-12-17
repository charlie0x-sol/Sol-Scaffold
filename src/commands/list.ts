import { Command } from 'commander';
import { readdir } from 'fs/promises';
import chalk from 'chalk';
import { getTemplateDir } from '../utils/paths.js';

export const listCommand = new Command('list')
  .description('List available DeFi primitives')
  .action(async () => {
    const templatesDir = getTemplateDir();
    const availableTemplates = await readdir(templatesDir);
    
    console.log(chalk.green('Available DeFi primitives:'));
    availableTemplates.forEach(template => {
      console.log(`- ${chalk.blue(template)}`);
    });
  });
