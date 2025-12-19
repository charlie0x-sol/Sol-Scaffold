import { Command } from 'commander';
import _fse from 'fs-extra';
const fse = _fse;
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { Keypair } from '@solana/web3.js';
import { readdir, readFile, writeFile } from 'fs/promises';

export const syncCommand = new Command('sync')
  .description('Sync program ID from target/deploy to Anchor.toml, lib.rs, and frontend')
  .action(async () => {
    const spinner = ora('Syncing Program IDs...').start();

    const deployDir = path.join(process.cwd(), 'target', 'deploy');
    if (!(await fse.pathExists(deployDir))) {
        spinner.fail(chalk.red('target/deploy directory not found. Run `anchor build` first.'));
        return;
    }

    try {
        const files = await readdir(deployDir);
        const keypairFiles = files.filter(f => f.endsWith('-keypair.json'));

        if (keypairFiles.length === 0) {
            spinner.fail(chalk.red('No keypairs found in target/deploy.'));
            return;
        }

        let updatedCount = 0;

        for (const kpFile of keypairFiles) {
            const programName = kpFile.replace('-keypair.json', ''); // kebab-case
            const kpPath = path.join(deployDir, kpFile);
            
            // Read keypair
            const secretKey = JSON.parse(await readFile(kpPath, 'utf-8'));
            const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
            const programId = keypair.publicKey.toBase58();

            spinner.text = `Syncing ${programName}: ${programId}`;

            // 1. Update Anchor.toml
            const anchorTomlPath = path.join(process.cwd(), 'Anchor.toml');
            if (await fse.pathExists(anchorTomlPath)) {
                let content = await readFile(anchorTomlPath, 'utf-8');
                // Regex to match [programs.localnet] ... program_name = "..."
                // We handle snake_case conversion for the key in toml
                const programNameSnake = programName.replace(/-/g, '_');
                
                // Replacements for both localnet and devnet if present
                // Matches `program_name = "..."`
                // Double escape backslashes for RegExp string
                const regex = new RegExp(`(${programNameSnake}\\s*=\\s*")([a-zA-Z0-9]+)(")`, 'g');
                
                if (regex.test(content)) {
                    content = content.replace(regex, `$1${programId}$3`);
                    await writeFile(anchorTomlPath, content);
                    updatedCount++;
                }
            }

            // 2. Update lib.rs
            // We need to find the correct program folder. usually programs/<program-name>
            // Program name in keypair is snake_case (crate name)
            // Folder might be kebab-case or snake_case
            let programDir = path.join(process.cwd(), 'programs', programName);
            if (!(await fse.pathExists(programDir))) {
                // Try kebab-case
                programDir = path.join(process.cwd(), 'programs', programName.replace(/_/g, '-'));
            }

            const libRsPath = path.join(programDir, 'src', 'lib.rs');
            
            if (await fse.pathExists(libRsPath)) {
                let content = await readFile(libRsPath, 'utf-8');
                // declare_id!("...")
                const regex = /declare_id!\s*\(\s*"[a-zA-Z0-9]+"\s*\)/;
                if (regex.test(content)) {
                    content = content.replace(regex, `declare_id!("${programId}")`);
                    await writeFile(libRsPath, content);
                    updatedCount++;
                }
            }

            // 3. Update Frontend (App)
            // Heuristic: Look for PROGRAM_ID definition in app/
            const appDir = path.join(process.cwd(), 'app');
            if (await fse.pathExists(appDir)) {
                 // Recursive search or just look in common places?
                 // Let's do a quick recursive search for .ts/.tsx files, but limit depth/count for performance
                 const filesToScan = await getAllFiles(appDir, ['.ts', '.tsx']);
                 for (const file of filesToScan) {
                     let content = await readFile(file, 'utf-8');
                     // Pattern: const PROGRAM_ID = new PublicKey("...")
                     // or PROGRAM_ID = "..."
                     // We match the specific key if possible, but identifying WHICH constant corresponds to WHICH program is hard if multiple.
                     // For scaffolding, we usually have one.
                     
                     // Safer regex: look for the old ID? No we don't know it easily unless we read it.
                     // Look for `new PublicKey("...")`? Too broad.
                     
                     // Let's rely on the scaffold's convention: `const PROGRAM_ID = new PublicKey("...");`
                     // We will only replace if we find a PublicKey construction.
                     // And maybe we can match the comment? No.
                     
                     // Let's try to match the exact string "const PROGRAM_ID = new PublicKey("...")"
                     const regex = /(const\s+PROGRAM_ID\s*=\s*new\s+(?:PublicKey|web3\.PublicKey)\s*\(\s*")([a-zA-Z0-9]+)("\s*\))/;
                     if (regex.test(content)) {
                         content = content.replace(regex, `$1${programId}$3`);
                         await writeFile(file, content);
                         updatedCount++;
                         break; // Assume one definition per app for now to avoid over-updating
                     }
                 }
            }
        }

        if (updatedCount > 0) {
            spinner.succeed(chalk.green(`Synced Program IDs for ${keypairFiles.length} program(s).`));
        } else {
            spinner.warn(chalk.yellow('No files needed updating or could not find patterns.'));
        }

    } catch (e) {
        spinner.fail(chalk.red('Error syncing program IDs.'));
        console.error(e);
    }
  });

// Helper to find files recursively
async function getAllFiles(dir: string, extensions: string[], fileList: string[] = []): Promise<string[]> {
    const files = await readdir(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fse.stat(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                await getAllFiles(filePath, extensions, fileList);
            }
        } else {
            if (extensions.some(ext => file.endsWith(ext))) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}
