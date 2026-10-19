// RG-SOUND service worker. Меняй VERSION при обновлении оболочки.
const VERSION='v1',SHELL='rg-shell-'+VERSION,COVERS='rg-covers',AUDIO='rg-audio';
const JSM='https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js';
const ASSETS=['./','index.html','qrcode.js','default.jpg','default_500.jpg','cover.svg','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(async c=>{await c.addAll(ASSETS);try{await c.add(new Request(JSM,{mode:'cors'}))}catch(_){}}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('rg-shell-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const strip=u=>{const x=new URL(u);x.search='';x.hash='';return x.href};
async function netFirst(req,key){const c=await caches.open(SHELL);try{const r=await fetch(req,{cache:'no-store'});if(r.ok)c.put(key,r.clone());return r}catch(e){const m=await c.match(key);if(m)return m;throw e}}
async function swr(req,name){const c=await caches.open(name),key=strip(req.url),m=await c.match(key);
 const n=fetch(req).then(r=>{if(r.ok&&r.status===200)c.put(key,r.clone());return r}).catch(()=>null);return m||(await n)||Response.error()}
async function audio(req,m){const blob=await m.blob(),size=blob.size,type=m.headers.get('Content-Type')||'audio/mpeg',rg=req.headers.get('Range');
 if(!rg)return new Response(blob,{status:200,headers:{'Content-Type':type,'Content-Length':String(size),'Accept-Ranges':'bytes'}});
 const x=/bytes=(\d*)-(\d*)/.exec(rg);let s,e;
 if(!x)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 if(x[1]===''){s=Math.max(0,size-(+x[2]||0));e=size-1}else{s=+x[1];e=x[2]===''?size-1:Math.min(+x[2],size-1)}
 if(s>=size||s>e)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 return new Response(blob.slice(s,e+1,type),{status:206,statusText:'Partial Content',headers:{'Content-Type':type,'Content-Length':String(e-s+1),'Content-Range':`bytes ${s}-${e}/${size}`,'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
 if(req.url===JSM){e.respondWith(caches.match(JSM).then(m=>m||fetch(req)));return}
 if(u.origin!==location.origin)return;const scope=new URL(self.registration.scope).pathname,p=u.pathname.slice(scope.length);
 if(p.startsWith('audio/')){e.respondWith(caches.open(AUDIO).then(c=>c.match(strip(req.url))).then(m=>m?audio(req,m):fetch(req)));return}
 if(req.mode==='navigate'||p===''||p==='index.html'){e.respondWith(netFirst(req,new URL('index.html',self.registration.scope).href));return}
 if(p==='tracks.json'){e.respondWith(netFirst(req,strip(req.url)));return}
 if(p.startsWith('covers/')){e.respondWith(swr(req,COVERS));return}
 e.respondWith(caches.open(SHELL).then(c=>c.match(strip(req.url))).then(m=>m||fetch(req)))});
