import * as fse from 'fs-extra';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import * as path from 'path';

export async function copyTemplate(templateDir: string, destDir: string) {
  return fse.copy(templateDir, destDir, {
    filter: (src) => {
      const basename = path.basename(src);
      return basename !== 'node_modules' && basename !== 'package-lock.json';
    }
  });
}

export async function customizeTemplate(filePath: string, projectName: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const newContent = content.replace(/<%= projectName %>/g, projectName);
  await fs.writeFile(filePath, newContent);
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
