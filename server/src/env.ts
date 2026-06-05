export function requireEnv(name: string, opts: { minLength?: number } = {}): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[FATAL] Missing required environment variable: ${name}`);
    console.error(`Set it in your environment or via server/.env before starting the service.`);
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
