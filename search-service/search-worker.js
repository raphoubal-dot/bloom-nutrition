/**
 * Bloom — optional Cloudflare Worker for public food queries.
 * Only search terms go through here. No personal nutrition data.
 * Typeahead uses Search-a-licious; legacy search is only for explicit searches.
 */
const ORIGIN='https://raphoubal-dot.github.io';
const UA='BloomNutrition/0.1 (https://github.com/raphoubal-dot/bloom-nutrition)';
const FIELDS='code,product_name,product_name_fr,brands,nutriments';
function cors(){return {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};}
function respond(body,status=200){return new Response(JSON.stringify(body),{status,headers:cors()});}
function productFrom(hit){
  const raw=hit?._source||hit?.source||hit?.document||hit?.data||hit;
  const p=raw?.product||raw;
  if(!p||typeof p!=='object')return null;
  const code=String(p.code||p._id||'');
  const name=String(p.product_name_fr||p.product_name||'').trim();
  if(!/^\d{8,14}$/.test(code)||!name)return null;
  const n=p.nutriments||{},allowed=['energy-kcal_100g','energy_100g','proteins_100g','carbohydrates_100g','fat_100g','fiber_100g','sugars_100g'],nutriments={};
  for(const field of allowed)if(n[field]!==undefined&&n[field]!==null&&Number.isFinite(Number(n[field])))nutriments[field]=Number(n[field]);
  return {code,product_name:name.slice(0,200),brands:String(p.brands||'').slice(0,100),nutriments};
}
async function requestJSON(url,{method='GET',body=null,timeout=3500}={}){
 const options={method,signal:AbortSignal.timeout(timeout),headers:{'Accept':'application/json','User-Agent':UA}};
 if(body!==null){options.headers['Content-Type']='application/json';options.body=JSON.stringify(body)}
 const resp=await fetch(url,options);
 if(resp.status===429)throw Error('RATE_LIMIT');
 if(!resp.ok)throw Error('OFF_'+resp.status);
 return await resp.json();
}
async function search(q,mode){
 const opts={q,page_size:20,langs:['fr','en'],fields:FIELDS.split(',')};
 let searchError=null;
 // Current Search-a-licious production endpoint; then alternate API domain.
 for(const host of ['https://search.openfoodfacts.net','https://search.openfoodfacts.org']){
  try{
   const data=await requestJSON(host+'/search',{method:'POST',body:opts,timeout:3500});
   if(Array.isArray(data?.errors)&&data.errors.length)throw Error('OFF_SEARCH');
   const hits=Array.isArray(data?.hits)?data.hits:Array.isArray(data?.results)?data.results:[];
   const products=hits.map(productFrom).filter(Boolean);
   if(products.length || Array.isArray(data?.hits) || Array.isArray(data?.results))
    return {products,source:'search-a-licious'};
  }catch(e){searchError=e}
 }
 // Never call rate-limited legacy keyword search on every typed character.
 if(mode==='suggest')throw searchError||Error('OFF_SEARCH');
 const legacy=new URL('https://world.openfoodfacts.org/cgi/search.pl');
 for(const [k,v] of Object.entries({search_terms:q,search_simple:'1',action:'process',json:'1',page_size:'20',fields:FIELDS}))legacy.searchParams.set(k,v);
 const data=await requestJSON(legacy.toString(),{timeout:4500});
 return {products:(Array.isArray(data?.products)?data.products:[]).map(productFrom).filter(Boolean),source:'legacy'};
}
export default {
 async fetch(request,env,ctx){
  const origin=request.headers.get('Origin');
  if(origin&&origin!==ORIGIN)return new Response('Forbidden',{status:403});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors()});
  if(request.method!=='GET')return respond({error:'Method not allowed'},405);
  const u=new URL(request.url);
  if(u.pathname==='/health')return respond({status:'ok',service:'bloom-food-search'});
  if(u.pathname!=='/search')return respond({error:'Not found'},404);
  const q=String(u.searchParams.get('q')||'').trim().replace(/\s+/g,' ').slice(0,80);
  const mode=u.searchParams.get('mode')==='suggest'?'suggest':'search';
  if(q.length<3)return respond({error:'Au moins 3 caractères'},400);
  const cacheKey=new Request('https://bloom-cache.internal/search?'+new URLSearchParams({q:q.toLocaleLowerCase('fr'),mode}));
  const cached=await caches.default.match(cacheKey);
  if(cached)return new Response(cached.body,{status:200,headers:{...cors(),'X-Bloom-Cache':'hit'}});
  try{
    const data=await search(q,mode);
    const text=JSON.stringify(data);
    ctx.waitUntil(caches.default.put(cacheKey,new Response(text,{headers:{'Cache-Control':'public, max-age=900','Content-Type':'application/json'}})));
    return new Response(text,{status:200,headers:cors()});
  }catch(e){
    if(e?.message==='RATE_LIMIT')return respond({error:'Open Food Facts limite temporairement les requêtes.'},429);
    return respond({error:'Recherche temporairement indisponible.'},503);
  }
 }
};