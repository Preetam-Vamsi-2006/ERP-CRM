import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not set in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export async function initializeDatabase() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.warn('Database connection failed. Continuing anyway...');
    return false;
  }
}
