/* PWA offline: actualiza CACHE_VERSION cuando cambie el contenido. */
const CACHE_VERSION='consejos-v0.2.0';
const CORE=['./','./index.html','./styles.css','./app.js','./data.js','./manifest.webmanifest','./assets/flores.png','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-180.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_VERSION && key.startsWith('consejos-')).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(req,copy));}return response;}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(req,copy));}
    return response;
  })));
});
