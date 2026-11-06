const CACHE='jilgm-v95';
const CORE_ASSETS=['./','./index.html','./logo.jpg','./icon-192.png','./icon-512.png'];
const CDN_ASSETS=['https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js','https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'];
self.addEventListener('install',e=>{
e.waitUntil(caches.open(CACHE).then(c=>{
CDN_ASSETS.forEach(u=>c.add(u).catch(()=>{}));
return c.addAll(CORE_ASSETS.map(u=>new Request(u,{cache:'reload'})));
}));
self.skipWaiting();
});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
function netFirst(req){
const net=fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put('./',c))}return r});
const fallback=()=>caches.match('./').then(r=>r||caches.match('./index.html'));
const timer=new Promise(res=>setTimeout(()=>res(fallback()),3500));
return Promise.race([net.catch(fallback),timer]).then(r=>r||net);
}
self.addEventListener('fetch',e=>{
if(e.request.url.includes('script.google.com')||e.request.method==='POST'){e.respondWith(fetch(e.request));return}
if(e.request.mode==='navigate'){e.respondWith(netFirst(e.request));return}
e.respondWith(caches.match(e.request).then(r=>{
if(r)return r;
return fetch(e.request).then(response=>{
if(response.ok&&(e.request.url.includes('unpkg.com')||e.request.url.includes('cdn.jsdelivr.net'))){
const clone=response.clone();
caches.open(CACHE).then(c=>c.put(e.request,clone));
}
return response;
}).catch(()=>caches.match('./index.html'));
}));
});
