import fs from 'fs';
import path from 'path';

export function cleanDist(distPath) {
  fs.mkdirSync(distPath, { recursive: true });

  for (const entry of fs.readdirSync(distPath)) {
    fs.rmSync(path.join(distPath, entry), { recursive: true, force: true });
  }

  return 'cleaned dist contents';
}

export function recreateDist(distPath) {
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    return 'created dist';
  }

  try {
    fs.rmSync(distPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    if (error?.code !== 'EPERM' && error?.code !== 'EBUSY') {
      throw error;
    }

    cleanDist(distPath);
    fs.mkdirSync(distPath, { recursive: true });
    return `cleaned dist contents after ${error.code} prevented deleting the dist folder`;
  }

  fs.mkdirSync(distPath, { recursive: true });
  return 'deleted and recreated dist';
}

