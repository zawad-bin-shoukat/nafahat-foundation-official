import {readFile} from 'node:fs/promises';
import {createConnection,postgresExecutor} from '../server/postgres.js';
import {validateSnapshot,importSnapshot} from '../server/migration.js';
const file=process.argv.slice(2).find(arg=>!arg.startsWith('--')),apply=process.argv.includes('--apply');
if(!file){console.error('Usage: npm run db:import -- backups/full-snapshot.json [--apply]. Default: validation only.');process.exit(1)}
let sql;try{const snapshot=JSON.parse(await readFile(file,'utf8'));const manifest=validateSnapshot(snapshot);if(!apply)console.log(JSON.stringify({dryRun:true,...manifest},null,2));else{sql=createConnection(process.env.DATABASE_URL);console.log(JSON.stringify(await importSnapshot(postgresExecutor(sql),snapshot,{apply}),null,2))}}catch(error){console.error('Import stopped:',error.code||error.message);process.exitCode=1}finally{if(sql)await sql.end()}
