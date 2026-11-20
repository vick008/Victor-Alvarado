// Offline support: the app shell is cached; pages load fresh when online.
const CACHE='lp-82b6215abc';
const SHELL=['./','index.html','config.js','manifest.webmanifest','vendor/anthropic.mjs','icons/icon.svg','icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lp-')&&k!==CACHE&&k!=='lp-img').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
  } else if(u.hostname==='upload.wikimedia.org'||u.hostname==='fonts.gstatic.com'||u.hostname==='fonts.googleapis.com'){
    e.respondWith(caches.open('lp-img').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));
  }
});
