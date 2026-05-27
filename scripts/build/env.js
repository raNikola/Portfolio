import fs from 'fs';

export function loadLocalEnvironment(envPath = './.env.local') {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function getBuildEnvironment(argv = process.argv) {
  const envArg = argv.find(arg => arg.startsWith('--env='));
  const explicitEnv = envArg ? envArg.split('=')[1] : process.env.NODE_ENV;

  if (explicitEnv === 'production' || explicitEnv === 'prod') {
    return 'production';
  }

  if (explicitEnv === 'development'
    || explicitEnv === 'dev'
    || explicitEnv === 'local'
    || explicitEnv === 'staging'
    || explicitEnv === 'stage'
    || explicitEnv === 'preview'
    || explicitEnv === 'test') {
    return 'development';
  }

  if (process.env.npm_lifecycle_event === 'build'
    || process.env.npm_lifecycle_event === 'build:html'
    || process.env.npm_lifecycle_event === 'build:clean') {
    return 'production';
  }

  return 'development';
}

