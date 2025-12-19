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
  .option('-d, --dry-run', 'Preview changes without modifying the disk')
  .action(async (primitive, name, options) => {
    const templatesDir = getTemplateDir();
    const availableTemplates = (await readdir(templatesDir)).filter(t => !t.startsWith('_'));

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
    if (!options.dryRun && existsSync(destDir)) {
      console.error(chalk.red(`Error: Directory '${name}' already exists.`));
      return;
    }

    if (options.dryRun) {
      console.log(chalk.cyan('\n--- DRY RUN MODE ---'));
      console.log(chalk.gray('No files will be written to disk.\n'));
    }

    const spinner = ora(`${options.dryRun ? '[Dry Run] ' : ''}Scaffolding ${primitive} dApp in ${name}...`).start();

    const templateDir = path.join(getTemplateDir(), primitive);
    const sharedDir = path.join(getTemplateDir(), '_shared');

    try {
      spinner.text = 'Copying template files...';
      if (!options.dryRun) {
        // Copy shared files first
        if (existsSync(sharedDir)) {
          await copyTemplate(sharedDir, destDir);
        }
        // Copy primitive specific files (overwrites shared if needed)
        await copyTemplate(templateDir, destDir);
      } else {
        spinner.info(`[Dry Run] Would copy shared template from ${sharedDir} to ${destDir}`);
        spinner.info(`[Dry Run] Would copy template from ${templateDir} to ${destDir}`);
        spinner.start();
      }
      
      spinner.text = 'Generating program keypair...';
      const deployDir = path.join(destDir, 'target', 'deploy');
      let programId = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

      if (!options.dryRun) {
        await fse.ensureDir(deployDir);
        const keypairPath = path.join(deployDir, 'program-keypair.json');
        try {
          programId = await generateKeyPair(keypairPath);
        } catch (e) {
          spinner.warn('Could not generate a new program keypair. Using default ID.');
        }
      } else {
        programId = 'DRY_RUN_PROGRAM_ID_11111111111111111111111';
        spinner.info(`[Dry Run] Would generate keypair at ${path.join(deployDir, 'program-keypair.json')}`);
        spinner.start();
      }

      spinner.text = 'Customizing project...';
      
      // Handle program renaming
      const programName = name.replace(/-/g, '_'); // Default to snake_case for the folder/crate
      const programNameKebab = name.replace(/_/g, '-');
      const programNamePascalCase = name
        .split(/[-_]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      if (!options.dryRun) {
        const programsPath = path.join(destDir, 'programs');
        const programFolders = await readdir(programsPath);
        if (programFolders.length > 0) {
            const oldProgramFolder = programFolders[0];
            if (oldProgramFolder) {
                const newProgramPath = path.join(programsPath, programNameKebab);
                await fse.rename(path.join(programsPath, oldProgramFolder), newProgramPath);
            }
        }
      } else {
        spinner.info(`[Dry Run] Would rename program folder to ${programNameKebab}`);
        spinner.start();
      }

      const replacements = {
        projectName: name,
        programName: programNameKebab,
        programNameSnakeCase: programName,
        programNamePascalCase: programNamePascalCase,
        programId: programId,
      };

      if (!options.dryRun) {
        await customizeDirectory(destDir, replacements);
      } else {
        spinner.info('[Dry Run] Would customize project files with:');
        console.log(JSON.stringify(replacements, null, 2));
        spinner.start();
      }

      if (options.install) {
        if (!options.dryRun) {
          spinner.text = 'Installing dependencies (this may take a minute)...';
          await installDependencies(destDir);
        } else {
          spinner.info('[Dry Run] Would install dependencies');
          spinner.start();
        }
      } else {
        spinner.info('Skipping dependency installation.');
      }

      if (options.git) {
        if (!options.dryRun) {
          spinner.text = 'Initializing git repository...';
          try {
            execSync('git init', { cwd: destDir, stdio: 'ignore' });
            execSync('git add .', { cwd: destDir, stdio: 'ignore' });
            execSync('git commit -m "Initial commit from sol-scaffold"', { cwd: destDir, stdio: 'ignore' });
            spinner.info('Git repository initialized.');
          } catch (e) {
            spinner.warn('Could not initialize git repository.');
          }
        } else {
          spinner.info('[Dry Run] Would initialize git repository');
          spinner.start();
        }
      }
      
      spinner.succeed(chalk.green(`Project ${options.dryRun ? 'previewed' : 'created'} successfully!`));

      if (!options.dryRun) {
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
      }
    } catch (err) {
      spinner.fail(chalk.red('An unexpected error occurred.'));
      if (err instanceof Error) {
        console.error(chalk.red(err.message));
      }
    }
  });