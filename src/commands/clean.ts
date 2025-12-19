import { Command } from 'commander';
import _fse from 'fs-extra';
const fse = _fse;
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

export const cleanCommand = new Command('clean')
  .description('Clean build artifacts (node_modules, target, etc.) to free up space')
  .argument('[directory]', 'The directory to clean', '.')
  .option('-y, --yes', 'Skip confirmation prompt')
  .option('--dry-run', 'List files to be deleted without deleting them')
  .action(async (directory, options) => {
    const targetDir = path.resolve(directory || '.');
    
    if (!(await fse.pathExists(targetDir))) {
        console.error(chalk.red(`Error: Directory '${targetDir}' does not exist.`));
        return;
    }

    const foldersToClean = ['node_modules', 'target', '.anchor', 'dist', 'build', '.next'];
    const foundFolders: string[] = [];

    const spinner = ora('Scanning for artifacts...').start();

    // Shallow scan of the target directory + app subdirectory if it exists
    const candidates = [targetDir, path.join(targetDir, 'app')];

    for (const base of candidates) {
        if (await fse.pathExists(base)) {
            for (const folder of foldersToClean) {
                const fullPath = path.join(base, folder);
                if (await fse.pathExists(fullPath)) {
                    foundFolders.push(fullPath);
                }
            }
        }
    }

    spinner.stop();

    if (foundFolders.length === 0) {
        console.log(chalk.green('Already clean! No build artifacts found.'));
        return;
    }

    console.log(chalk.bold('\nThe following directories will be deleted:'));
    foundFolders.forEach(f => console.log(chalk.red(`- ${f}`)));
    console.log('');

    if (options.dryRun) {
        console.log(chalk.cyan('[Dry Run] No files were deleted.'));
        return;
    }

    if (!options.yes) {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to delete these directories?',
                default: false
            }
        ]);

        if (!confirm) {
            console.log('Operation cancelled.');
            return;
        }
    }

    const deleteSpinner = ora('Cleaning...').start();
    try {
        await Promise.all(foundFolders.map(f => fse.remove(f)));
        deleteSpinner.succeed(chalk.green('Cleaned successfully!'));
    } catch (err) {
        deleteSpinner.fail(chalk.red('Error deleting files.'));
        console.error(err);
    }
  });
