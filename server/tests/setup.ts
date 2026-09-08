import path from 'path';
import { execSync } from 'child_process';

process.env.DATABASE_URL = 'file:./test.db';
process.env.ADMIN_TOKEN = 'test-admin-token';

// Ensure test database schema is up to date (idempotent)
// Running unconditionally allows schema changes to self-heal
const serverDir = path.join(__dirname, '..');

try {
  execSync('DATABASE_URL="file:./test.db" npx prisma db push --skip-generate', {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'pipe',
  });
} catch (err) {
  throw new Error(
    `Failed to initialize test database schema: ${err instanceof Error ? err.message : String(err)}`
  );
}
