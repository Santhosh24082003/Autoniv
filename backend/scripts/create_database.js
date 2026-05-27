require('dotenv').config();

const postgres = require('postgres');
const { URL } = require('url');

const connectionString = process.env.DATABASE_URL ;

async function ensureDatabase() {
  try {
    const url = new URL(connectionString);
    const dbName = (url.pathname || '').replace(/^\//, '') || 'autoniv';

    // Connect to default 'postgres' database as admin to create the target database
    url.pathname = '/postgres';
    const adminConn = postgres(url.toString(), { max: 1 });

    const rows = await adminConn`SELECT 1 FROM pg_database WHERE datname = ${dbName};`;
    if (rows.length) {
      console.log(`Database '${dbName}' already exists.`);
      await adminConn.end();
      return;
    }

    console.log(`Creating database '${dbName}'...`);
    // CREATE DATABASE does not accept bound parameters for the database name.
    await adminConn.unsafe(`CREATE DATABASE "${dbName}";`);
    console.log('Database created.');
    await adminConn.end();
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    process.exit(1);
  }
}

ensureDatabase();
