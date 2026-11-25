// Drafts share the existing durable content table, under a reserved internal kind.
// Public readers never include this kind. Every write is compare-and-swap inside
// the adapter's transaction-backed batch, so stale reviewers cannot publish edits.
export const draftKey=id=>'draft:'+id;
export async function readDraft(db,id){const row=await db.prepare('SELECT payload,updated_at FROM content WHERE id=? AND kind=?').bind(draftKey(id),'draft').first();return row?{...JSON.parse(row.payload),version:row.updated_at}:null}
export async function draftList(db){const rows=await db.prepare('SELECT payload,updated_at FROM content WHERE kind=? ORDER BY updated_at DESC').bind('draft').all();return rows.results.map(row=>({...JSON.parse(row.payload),version:row.updated_at}))}
export async function saveRevision({db,id,kind,payload,action,actor,role,version,note='',publishedVersion=null}){
 const existing=await readDraft(db,id);
 if((existing&&version===undefined)||(version!==undefined&&version!==(existing?.version??null)))return {error:'This draft has changed. Reload it before saving or publishing.',status:409};
 if(['publish','request-changes'].includes(action)&&role!=='admin')return {error:'Only an administrator can publish or request changes.',status:403};
 if(action==='request-changes'&&(!existing||!note.trim()))return {error:'Enter a review note for an existing draft.',status:400};
 const currentLive=await db.prepare('SELECT updated_at FROM content WHERE id=?').bind(id).first();
 if(existing&&['submit','publish'].includes(action)&&existing.stage!=='published'&&existing.basePublishedVersion!==(currentLive?.updated_at??null))return {error:'The published content changed while this draft was open. Reload the published version and merge your changes.',status:409};
 const now=new Date().toISOString(),token=now+':'+crypto.randomUUID();
 const next={id,kind:kind||existing?.kind,payload:payload||existing?.payload,stage:action==='publish'?'published':action==='submit'?'review':action==='request-changes'?'changes':'draft',reviewNote:action==='request-changes'?note.trim().slice(0,2000):existing?.reviewNote||'',updatedBy:actor,updatedAt:now,basePublishedVersion:action==='publish'?token:existing&&existing.stage!=='published'?existing.basePublishedVersion:currentLive?.updated_at??publishedVersion};
 const statements=[];
 if(existing)statements.push(db.prepare('UPDATE content SET payload=?,updated_at=? WHERE id=? AND kind=? AND updated_at=?').bind(JSON.stringify(next),token,draftKey(id),'draft',existing.version));
 else statements.push(db.prepare('INSERT INTO content (id,kind,payload,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(draftKey(id),'draft',JSON.stringify(next),token));
 const guard='EXISTS (SELECT 1 FROM content WHERE id=? AND kind=? AND updated_at=?)';
 if(action==='publish')statements.push(db.prepare(`INSERT INTO content (id,kind,payload,updated_at) SELECT ?,?,?,? WHERE ${guard} ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,payload=excluded.payload,updated_at=excluded.updated_at`).bind(id,next.kind,JSON.stringify(next.payload),token,draftKey(id),'draft',token));
 statements.push(db.prepare(`INSERT INTO audit (id,actor,action,target,details,created_at) SELECT ?,?,?,?,?,? WHERE ${guard}`).bind(crypto.randomUUID(),actor,'content.'+action,id,JSON.stringify({kind:next.kind,payload:next.payload,stage:next.stage,note:next.reviewNote}),now,draftKey(id),'draft',token));
 const result=await db.batch(statements);if(!(result[0].meta?.changes??result[0].changes))return {error:'Another team member saved this content first. Reload to avoid overwriting their work.',status:409};
 return {ok:true,draft:{...next,version:token}};
}
