require('dotenv').config();
const postgres = require('postgres');

async function main() {
  const conn = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const rows = await conn`select tablename from pg_tables where schemaname = 'public' order by tablename;`;
    console.log(rows);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
