import {readFile} from 'node:fs/promises';
import {createConnection} from '../server/postgres.js';
if(!process.env.DATABASE_URL){console.error('Set DATABASE_URL privately in .env.local. No database changes were made.');process.exit(1)}
const sql=createConnection(process.env.DATABASE_URL);
try{const ddl=await readFile(new URL('../supabase/migrations/001_foundation.sql',import.meta.url),'utf8');await sql.begin(async tx=>{await tx.unsafe(ddl)});console.log('Applied foundation schema. Existing records were preserved.')}catch(error){console.error('Schema migration failed:',error.code||'database error');process.exitCode=1}finally{await sql.end()}
