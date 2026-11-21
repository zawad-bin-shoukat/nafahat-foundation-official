import {getDatabase} from '@/server/postgres.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){const database=getDatabase();if(!database)return Response.json({ok:false,database:false,error:'Database is not configured.'},{status:503,headers:{'Cache-Control':'no-store'}});try{const row=await database.prepare("SELECT version FROM foundation.schema_migrations WHERE version='001_foundation'").first();if(!row)throw new Error('Schema is not installed.');return Response.json({ok:true,database:true},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false,database:false,error:'Database connection or schema is not ready.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
