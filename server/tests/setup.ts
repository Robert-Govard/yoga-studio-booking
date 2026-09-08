import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

process.env.DATABASE_URL = 'file:./test.db';
process.env.ADMIN_TOKEN = 'test-admin-token';

// Ensure test database exists with schema
const serverDir = path.join(__dirname, '..');
const testDbPath = path.join(serverDir, 'prisma', 'test.db');

// Create test database with schema if it doesn't exist
if (!fs.existsSync(testDbPath)) {
  try {
    execSync('DATABASE_URL="file:./test.db" npx prisma db push --skip-generate', {
      cwd: serverDir,
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
      stdio: 'pipe',
    });
  } catch (err) {
    console.error('Failed to setup test database:', err.message);
  }
}
