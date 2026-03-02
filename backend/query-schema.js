#!/usr/bin/env node

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

async function querySchema() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL\n');

    // Query users table structure
    console.log('=== USERS TABLE SCHEMA ===');
    const usersSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log(usersSchema.rows);
    console.log();

    // Query admins table structure  
    console.log('=== ADMINS TABLE SCHEMA ===');
    const adminsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admins'
      ORDER BY ordinal_position;
    `);
    console.log(adminsSchema.rows);
    console.log();

    // Query jobs table structure
    console.log('=== JOBS TABLE SCHEMA ===');
    const jobsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position;
    `);
    console.log(jobsSchema.rows);
    console.log();

    // Query formations table structure
    console.log('=== FORMATIONS TABLE SCHEMA ===');
    const formationsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'formations'
      ORDER BY ordinal_position;
    `);
    console.log(formationsSchema.rows);

    client.release();
    console.log('\n✓ Schema extraction complete');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

querySchema();
