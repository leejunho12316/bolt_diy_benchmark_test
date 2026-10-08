import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { DATABASE_PATH } from '$app/env/private';
import * as schema from './schema.ts';

mkdirSync(dirname(DATABASE_PATH), { recursive: true });

const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Apply pending migrations on startup so a fresh checkout needs no separate DB setup step.
migrate(db, { migrationsFolder: 'drizzle' });

export { schema };
