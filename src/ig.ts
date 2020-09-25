import os from 'os';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { program } from 'commander';

import { download } from './utils';

const url = 'https://codeload.github.com/github/gitignore/zip/master';
const dataDir = '.ig-data';
const dataPath = path.join(os.homedir(), dataDir);

function findGitIgnores(): Map<string, string> {
  const fileList = new Map<string, string>();

  if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

  const files = fs.readdirSync(dataPath);

  files.forEach((file) => {
    const name = file.replace('.gitignore', '').toLowerCase();
    const filePath = path.join(dataPath, file);

    fileList.set(name, filePath);
  });

  return fileList;
}

function availableFiles(): void {
  const gitignores = findGitIgnores();

  const availableGitIgnores: string[] = [];

  gitignores.forEach((_, key) => availableGitIgnores.push(key));

  console.log(util.format(availableGitIgnores.join(',\n')));
}

async function update(): Promise<void> {
  fs.rmdirSync(dataPath);

  await download(url, dataPath);
}

function generate(value: string): void {
  const langs = value.split(',');

  const gitignores = findGitIgnores();

  const notFound: string[] = [];

  let out = '';

  langs.forEach((lang) => {
    const filePath = gitignores.get(lang);

    if (filePath) {
      const fileData = fs.readFileSync(filePath);

      out += `\n#### ${lang} ####\n`;
      out += fileData;
    } else notFound.push(lang);
  });

  if (notFound.length > 0) {
    console.log(`Unsupported files: ${notFound.join(',')}`);
    console.log("Run 'ig -ls' to see list of available gitignores");
  }

  console.log(out);
}

program
  .version('0.0.1')
  .arguments('<langs...>')
  .usage('[options] <langs...>')
  .description('auto generates cool .gitignore to you')
  .option('-g, --generate <langs...>', 'generates new .gitignore', generate)
  .option('-ls, --list', 'list available gitignores', availableFiles)
  .option('-u, --update', 'update all gitignores', update);

program.parse(process.argv);
