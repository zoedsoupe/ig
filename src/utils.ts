import fs from 'fs';
import https from 'https';
import path from 'path';
import cd from 'child_process';

function getData(url: string): Promise<Buffer> {
  return new Promise<Buffer>((fulfill, reject) => {
    https
      .get(url, (res) => {
        const data: Buffer[] = [];

        res.on('data', (chunk) => data.push(chunk));

        res.on('end', () => fulfill(Buffer.concat(data)));

        res.on('error', reject);
      })
      .end();
  });
}

async function download(url: string, dataPath: string): Promise<void> {
  const archivePath = path.join('/tmp', 'master.zip');

  const b = await getData(url);

  fs.writeFileSync(archivePath, b);

  cd.execSync(`unzip ${archivePath} -d /tmp`);

  cd.execSync(`mv ${path.join('/tmp', 'gitignore-master')} ${dataPath}`);
}

export { download };
