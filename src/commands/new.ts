import { Command } from 'commander';
import fse from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';

import { getTemplateDir } from '../utils/paths.js';
import { copyTemplate, customizeTemplate, installDependencies } from '../utils/files.js';

export const newCommand = new Command('new')
  .description('Create a new Solana dApp from a template')
  .argument('[primitive]', 'The primitive to scaffold')
  .argument('[name]', 'The name of the project')
  .action(async (primitive, name) => {
    const templatesDir = getTemplateDir();
    const availableTemplates = await fse.readdir(templatesDir);

    if (!primitive) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'primitive',
          message: 'Which DeFi primitive would you like to scaffold?',
          choices: availableTemplates,
        },
      ]);
      primitive = answers.primitive;
    }

    if (!availableTemplates.includes(primitive)) {
        console.error(chalk.red(`Error: Template '${primitive}' not found. Available templates: ${availableTemplates.join(', ')}`));
        return;
    }

    if (!name) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is the name of your project?',
          default: `my-${primitive}-dapp`,
          validate: (input) => {
             if (/^([a-z0-9\-\_]+)$/.test(input)) return true;
             return 'Project name may only include letters, numbers, underscores and hashes.';
          }
        },
      ]);
      name = answers.name;
    }

    const destDir = path.join(process.cwd(), name);
    if (fse.existsSync(destDir)) {
      console.error(chalk.red(`Error: Directory '${name}' already exists.`));
      return;
    }

    console.log(chalk.blue(`Creating a new ${primitive} dApp named ${name}`));

    const templateDir = path.join(getTemplateDir(), primitive);

    try {
      await copyTemplate(templateDir, destDir);
      await customizeTemplate(path.join(destDir, 'package.json'), name);
      console.log(chalk.blue('Installing dependencies...'));
      await installDependencies(destDir);
      console.log(chalk.green('Project created successfully!'));

      try {
        execSync('anchor --version', { stdio: 'ignore' });
      } catch {
        console.log(chalk.yellow('\nWarning: Anchor CLI not found. You will need it to build your project.'));
        console.log('Install it here: https://www.anchor-lang.com/docs/installation');
      }

      try {
        execSync('solana --version', { stdio: 'ignore' });
      } catch {
        console.log(chalk.yellow('\nWarning: Solana CLI not found.'));
        console.log('Install it here: https://docs.solana.com/cli/install-solana-cli-tools');
      }

      console.log('\nNext steps:');
      console.log(`  cd ${name}`);
      console.log('  solana-test-validator (in a separate terminal)');
      console.log('  anchor build');
      console.log('  (Don\'t forget to update declare_id! in lib.rs and Anchor.toml with your new program ID)');
      console.log('  anchor deploy');
      console.log('  anchor test');
    } catch (err) {
      console.error(chalk.red('An unexpected error occurred.'));
      if (err instanceof Error) {
        console.error(chalk.red(err.message));
      }
    }
  });