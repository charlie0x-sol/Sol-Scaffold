import * as path from 'path';

export function getTemplateDir() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  return path.join(__dirname, '../..', 'templates');
}
