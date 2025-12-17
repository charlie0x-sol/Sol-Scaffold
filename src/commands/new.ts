import { Command } from 'commander';
import _fse from 'fs-extra';
const fse = _fse;
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import ora from 'ora';

import { getTemplateDir } from '../utils/paths.js';
import { copyTemplate, customizeDirectory, installDependencies, generateKeyPair } from '../utils/files.js';

export const newCommand = new Command('new')
  .description('Create a new Solana dApp from a template')
  .argument('[primitive]', 'The primitive to scaffold')
  .argument('[name]', 'The name of the project')
  .option('--no-install', 'Skip dependency installation')
  .option('--git', 'Initialize a git repository')
  .action(async (primitive, name, options) => {
    const templatesDir = getTemplateDir();
    const availableTemplates = await readdir(templatesDir);

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
    if (existsSync(destDir)) {
      console.error(chalk.red(`Error: Directory '${name}' already exists.`));
      return;
    }

    const spinner = ora(`Scaffolding ${primitive} dApp in ${name}...`).start();

    const templateDir = path.join(getTemplateDir(), primitive);

    try {
      spinner.text = 'Copying template files...';
      await copyTemplate(templateDir, destDir);
      
      spinner.text = 'Generating program keypair...';
      const deployDir = path.join(destDir, 'target', 'deploy');
      await fse.ensureDir(deployDir);
      
      const keypairPath = path.join(deployDir, 'program-keypair.json');
      let programId = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
      try {
        programId = await generateKeyPair(keypairPath);
      } catch (e) {
        spinner.warn('Could not generate a new program keypair. Using default ID.');
      }

      spinner.text = 'Customizing project...';
      
      // Handle program renaming
      const programName = name.replace(/-/g, '_'); // Default to snake_case for the folder/crate
      const programNameKebab = name.replace(/_/g, '-');
      
      const programsPath = path.join(destDir, 'programs');
      const programFolders = await readdir(programsPath);
      if (programFolders.length > 0) {
          const oldProgramFolder = programFolders[0];
          if (oldProgramFolder) {
              const newProgramPath = path.join(programsPath, programNameKebab);
              await fse.rename(path.join(programsPath, oldProgramFolder), newProgramPath);
          }
      }

      const replacements = {
        projectName: name,
        programName: programNameKebab,
        programNameSnakeCase: programName,
        programId: programId,
      };
      await customizeDirectory(destDir, replacements);

      if (options.install) {
        spinner.text = 'Installing dependencies (this may take a minute)...';
        await installDependencies(destDir);
      } else {
        spinner.info('Skipping dependency installation.');
      }

      if (options.git) {
        spinner.text = 'Initializing git repository...';
        try {
          execSync('git init', { cwd: destDir, stdio: 'ignore' });
          execSync('git add .', { cwd: destDir, stdio: 'ignore' });
          execSync('git commit -m "Initial commit from sol-scaffold"', { cwd: destDir, stdio: 'ignore' });
          spinner.info('Git repository initialized.');
        } catch (e) {
          spinner.warn('Could not initialize git repository.');
        }
      }
      
      spinner.succeed(chalk.green('Project created successfully!'));

      // Check for tools
      const missingTools = [];
      try { execSync('anchor --version', { stdio: 'ignore' }); } catch { missingTools.push('Anchor CLI'); }
      try { execSync('solana --version', { stdio: 'ignore' }); } catch { missingTools.push('Solana CLI'); }
      
      if (missingTools.length > 0) {
        console.log(chalk.yellow(`\nWarning: The following tools are missing: ${missingTools.join(', ')}`));
        console.log('You will need them to build and deploy your project.');
      }

      console.log('\nNext steps:');
      console.log(`  ${chalk.blue(`cd ${name}`)}`);
      console.log(`  ${chalk.blue('anchor build')}`);
      console.log(`  ${chalk.blue('anchor test')}`);
      console.log('\nHappy coding!');
    } catch (err) {
      spinner.fail(chalk.red('An unexpected error occurred.'));
      if (err instanceof Error) {
        console.error(chalk.red(err.message));
      }
    }
  });