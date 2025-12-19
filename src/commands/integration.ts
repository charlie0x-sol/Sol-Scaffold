import { Command } from 'commander';
import _fse from 'fs-extra';
const fse = _fse;
import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

import { getTemplateDir } from '../utils/paths.js';
import { copyTemplate } from '../utils/files.js';

import { KNOWN_PROGRAMS, dumpProgram, checkSolanaCli } from '../utils/programs.js';



export const integrationCommand = new Command('integration')

  .alias('int')

  .description('Scaffold a robust integration testing environment')

  .option('--rpc <url>', 'Mainnet RPC URL for forking')

  .option('-y, --yes', 'Skip prompts and use default settings')

  .action(async (options) => {

    const projectRoot = process.cwd();

    

    // 1. Basic Validation: Are we in an Anchor project?

    if (!existsSync(path.join(projectRoot, 'Anchor.toml'))) {

      console.error(chalk.red('Error: This command must be run from the root of an Anchor project (Anchor.toml not found).'));

      return;

    }



    console.log(chalk.cyan('\n🚀 Scaffolding Integration Test Environment\n'));



    // 2. Interactive Prompts

    let answers = {

      enableForking: false,

      rpcUrl: options.rpc || 'https://api.mainnet-beta.solana.com',

      protocols: ['spl'],

    };



    if (!options.yes) {

      answers = await inquirer.prompt([

        {

          type: 'confirm',

          name: 'enableForking',

          message: 'Would you like to enable Mainnet Forking capability?',

          default: false,

        },

        {

          type: 'input',

          name: 'rpcUrl',

          message: 'Enter Mainnet RPC URL:',

          when: (a) => !options.rpc, // Ask if not provided via flag, regardless of forking choice (needed for dumps too)

          default: 'https://api.mainnet-beta.solana.com',

          validate: (input) => input.startsWith('http') ? true : 'Please enter a valid URL',

        },

        {

          type: 'checkbox',

          name: 'protocols',

          message: 'Select protocols to download mocks for:',

          choices: [

            { name: 'SPL Token (Standard)', value: 'spl', checked: true },

            { name: 'Serum/OpenBook DEX', value: 'serum' },

            { name: 'Raydium V4', value: 'raydium' },

            { name: 'Pyth Network (Oracles)', value: 'pyth' },

            { name: 'Metaplex Metadata', value: 'metaplex' },

          ],

        }

      ]);

      

      // Merge flag RPC if user wasn't prompted

      if (options.rpc) answers.rpcUrl = options.rpc;

    }



    const spinner = ora('Copying integration templates...').start();



    try {

      const templateDir = path.join(getTemplateDir(), 'integration');

      const destDir = path.join(projectRoot, 'tests', 'integration');

      const fixturesDir = path.join(destDir, 'fixtures');



      if (existsSync(destDir) && !options.yes) {

        spinner.stop();

        const overwrite = await inquirer.prompt([

          {

            type: 'confirm',

            name: 'confirm',

            message: chalk.yellow('tests/integration already exists. Overwrite?'),

            default: false,

          }

        ]);

        if (!overwrite.confirm) {

          console.log(chalk.gray('Aborted.'));

          return;

        }

        spinner.start();

      }



      // Copy files

      await fse.ensureDir(destDir);

      await copyTemplate(templateDir, destDir);

      

      spinner.text = 'Updating package.json...';

      const pkgPath = path.join(projectRoot, 'package.json');

      if (existsSync(pkgPath)) {

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

        

                                // Add scripts

        

                                pkg.scripts = pkg.scripts || {};

        

                                pkg.scripts['test:int'] = 'NODE_OPTIONS=\"--import tsx --experimental-vm-modules\" mocha tests/integration/scenarios/**/*.test.ts --timeout 100000';

        

                        

        

                

        

                        // Add dependencies if missing

        

                        pkg.devDependencies = pkg.devDependencies || {};

        

                        const depsToAdd = {

        

                          'chai': '^4.3.7',

        

                          '@types/chai': '^4.3.5',

        

                          'mocha': '^10.2.0',

        

                          '@types/mocha': '^10.0.1',

        

                          'tsx': '^4.19.1',

        

                          '@solana/web3.js': '^1.78.0',

        

                          '@solana/spl-token': '^0.3.8',

        

                          'chalk': '^4.1.2', // Template uses chalk 4 for compat

        

                        };

        

                



        for (const [dep, ver] of Object.entries(depsToAdd)) {

          if (!pkg.devDependencies[dep] && !pkg.dependencies?.[dep]) {

            pkg.devDependencies[dep] = ver;

          }

        }



        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

      }



      spinner.succeed(chalk.green('Integration environment scaffolded!'));



      // 3. Download Mocks

      const protocolsToDump = answers.protocols.filter((p: string) => p !== 'spl'); // SPL is built-in usually, skip dump

      

      if (protocolsToDump.length > 0) {

        if (checkSolanaCli()) {

             console.log(chalk.cyan('\nDownloading selected protocol binaries...'));

             await fse.ensureDir(fixturesDir);

             

             for (const protocol of protocolsToDump) {

                 dumpProgram(protocol, fixturesDir, answers.rpcUrl);

             }

        } else {

            console.log(chalk.yellow('\nSkipping downloads: Solana CLI not found.'));

            console.log('You can manually dump programs using:');

            protocolsToDump.forEach((p: string) => {

                const prog = KNOWN_PROGRAMS[p];

                if (prog) console.log(`  solana program dump -u mainnet-beta ${prog.programId} tests/integration/fixtures/${prog.programId}.so`);

            });

        }

      }



      console.log('\n' + chalk.bold('Summary:'));

      console.log(`- Created ${chalk.blue('tests/integration/')}`);

      console.log(`- Added ${chalk.blue('test:int')} script to package.json`);

      console.log(`- Configured ${chalk.blue('TestRelayer')} for local validator management`);



      if (answers.enableForking) {

        console.log(chalk.yellow('\nMainnet forking is enabled. Note that you may need a high-quality RPC for heavy cloning.'));

      }



      console.log('\n' + chalk.bold('Next steps:'));

      console.log(`1. ${chalk.cyan('npm install')} (to install new test dependencies)`);

      console.log(`2. ${chalk.cyan('npm run test:int')} (to run the sample integration test)`);

      console.log(`3. Check ${chalk.blue('tests/integration/fixtures/readme.md')} to learn how to mock external programs.`);



    } catch (err) {

      spinner.fail('Failed to scaffold integration environment.');

      if (err instanceof Error) console.error(err.message);

    }

  });


