import {createClient} from '@supabase/supabase-js';
export const MEDIA_BUCKET='campaign-media';
export const MAX_IMAGES=20;
export const MAX_UPLOAD_BYTES=2*1024*1024;
export function storageConfigured(env){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(env.SUPABASE_URL||'')&&/^(sb_secret_|eyJ)/.test(env.SUPABASE_SERVICE_ROLE_KEY||'')}
export function validateMediaRequest(b){return !/^[a-z0-9-]{1,60}$/.test(b.contentId||'')||!['project','post','event','report'].includes(b.kind)||b.contentType!=='image/webp'||!Number.isSafeInteger(b.size)||b.size<1||b.size>MAX_UPLOAD_BYTES?'Choose a supported image under 2 MB and enter a valid URL name before uploading.':null}
export async function signMedia(env,b){
 if(!storageConfigured(env))return {error:'Photo uploads need storage setup. Ask an administrator to configure Supabase Storage.',status:503};
 const invalid=validateMediaRequest(b);if(invalid)return {error:invalid,status:400};
 const client=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});
 const bucket=client.storage.from(MEDIA_BUCKET);
 let {data:settings,error:bucketError}=await client.storage.getBucket(MEDIA_BUCKET);
 if(bucketError&&(Number(bucketError.status)===404||/not found/i.test(bucketError.message))){
  const created=await client.storage.createBucket(MEDIA_BUCKET,{public:true,fileSizeLimit:MAX_UPLOAD_BYTES,allowedMimeTypes:['image/webp']});
  if(!created.error){settings={public:true};bucketError=null}else{const existing=await client.storage.getBucket(MEDIA_BUCKET);settings=existing.data;bucketError=existing.error}
 }
 if(bucketError||!settings?.public)return {error:'Create the public campaign-media bucket in Supabase Storage before uploading.',status:503};
 const path=b.kind+'/'+b.contentId+'/'+crypto.randomUUID()+'.webp';
 const {data,error}=await bucket.createSignedUploadUrl(path,{upsert:false});
 if(error||!data)return {error:'Unable to authorize the photo upload. Please try again.',status:503};
 return {path,token:data.token,publicUrl:bucket.getPublicUrl(path).data.publicUrl,bucket:MEDIA_BUCKET};
}
