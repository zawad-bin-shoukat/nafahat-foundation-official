import {handleAPI} from '@/server/api.js';
import {getDatabase} from '@/server/postgres.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
async function dispatch(request:Request){
 // Production never accepts the old platform's identity headers or local mock identities.
 const headers=new Headers(request.headers);
 headers.delete('cf-connecting-ip');
 const vercelIp=headers.get('x-vercel-forwarded-for');
 if(process.env.VERCEL==='1'&&vercelIp)headers.set('cf-connecting-ip',vercelIp.split(',')[0].trim());
 const requestOrigin=new URL(request.url);
 if(headers.get('host'))requestOrigin.host=headers.get('host')!;
 if(process.env.VERCEL==='1')requestOrigin.protocol='https:';
 const response=await handleAPI(new Request(request,{headers}),{DB:getDatabase(),REQUEST_ORIGIN:requestOrigin.origin,ADMIN_EMAILS:process.env.ADMIN_EMAILS||'',SUPABASE_URL:process.env.SUPABASE_URL||'',SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY||'',SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY||''});
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
export const GET=dispatch;
export const POST=dispatch;
export const PATCH=dispatch;
