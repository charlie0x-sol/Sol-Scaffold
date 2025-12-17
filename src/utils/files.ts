import _fse from 'fs-extra';
const fse = _fse;
import { readFile, writeFile, stat, readdir } from 'fs/promises';
import { spawn, execSync } from 'child_process';
import * as path from 'path';

export async function copyTemplate(templateDir: string, destDir: string) {
  return fse.copy(templateDir, destDir, {
    filter: (src) => {
      const basename = path.basename(src);
      return basename !== 'node_modules' && basename !== 'package-lock.json';
    }
  });
}

export async function customizeTemplate(filePath: string, replacements: Record<string, string>) {
  if (!await fse.pathExists(filePath)) return;
  let content = await readFile(filePath, 'utf-8');
  for (const [key, value] of Object.entries(replacements)) {
    const re = new RegExp(`<%= ${key} %>`, 'g');
    content = content.replace(re, value);
    // Also handle literal replacements for common Solana boilerplate if they don't use templates
    if (key === 'programId') {
      content = content.replace(/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS/g, value);
    }
  }
  await writeFile(filePath, content);
}

export async function customizeDirectory(dirPath: string, replacements: Record<string, string>) {
    const files = await readdir(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const s = await stat(fullPath);
        if (s.isDirectory()) {
            if (file === 'node_modules' || file === '.git') continue;
            await customizeDirectory(fullPath, replacements);
        } else {
            // Only customize text files
            const ext = path.extname(file);
            if (['.ts', '.rs', '.toml', '.json', '.md', '.tsx', '.js', '.css'].includes(ext)) {
                await customizeTemplate(fullPath, replacements);
            }
        }
    }
}

export async function generateKeyPair(destPath: string): Promise<string> {
    try {
        execSync(`solana-keygen new --no-passphrase --outfile ${destPath} --force`, { stdio: 'ignore' });
        const pubkey = execSync(`solana-keygen pubkey ${destPath}`, { stdio: 'pipe' }).toString().trim();
        return pubkey;
    } catch (e) {
        throw new Error('Failed to generate solana keypair');
    }
}

export async function installDependencies(destDir: string) {
  return new Promise<void>((resolve, reject) => {
    const installProcess = spawn('npm', ['install'], {
      cwd: destDir,
      stdio: 'inherit',
      shell: true,
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install exited with code ${code}`));
      }
    });

    installProcess.on('error', (err) => {
      reject(err);
    });
  });
}