import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const candidates = [
  process.env.ENV_FILE,
  '/app/.env',
  '/app/server/.env',
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'server', '.env')
].filter(Boolean) as string[];

for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`[env] loaded .env from ${p}`);
    break;
  }
}

export function requireEnv(name: string, opts: { minLength?: number } = {}): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[FATAL] Missing required environment variable: ${name}`);
    console.error(
      `Set it in your environment, via server/.env, or mount it into the container (e.g. - ./server/.env:/app/.env:ro).`
    );
    process.exit(1);
  }
  if (opts.minLength && value.length < opts.minLength) {
    console.error(
      `[FATAL] Environment variable ${name} must be at least ${opts.minLength} characters (current: ${value.length}).`
    );
    process.exit(1);
  }
  return value;
}
