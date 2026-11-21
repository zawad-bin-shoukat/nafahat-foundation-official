import {createConnection,postgresExecutor} from '../server/postgres.js';
import {databaseSummary} from '../server/migration.js';
if(!process.env.DATABASE_URL){console.error('Set DATABASE_URL privately in .env.local.');process.exit(1)}
const sql=createConnection(process.env.DATABASE_URL);try{console.log(JSON.stringify(await databaseSummary(postgresExecutor(sql)),null,2))}catch(error){console.error('Verification failed:',error.code||'database error');process.exitCode=1}finally{await sql.end()}
