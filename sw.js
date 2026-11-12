const CACHE='study-hq-builder-pwa-v2';
const ASSETS=[
'./',
'./index.html',
'./manifest.webmanifest',
'./icons/icon.svg',
'./icons/icon-192.png',
'./icons/icon-512.png'
];

self.addEventListener('install',event=>{
event.waitUntil(
caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
);
self.skipWaiting();
});

self.addEventListener('activate',event=>{
event.waitUntil(
caches.keys().then(keys=>Promise.all(
keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
))
);
self.clients.claim();
});

self.addEventListener('fetch',event=>{
const url=new URL(event.request.url);

if(event.request.method!=='GET'||!url.origin.startsWith('http'))return;

if(
url.hostname.includes('supabase')||
url.pathname.includes('/auth/')||
url.pathname.includes('/rest/v1/')
)return;

event.respondWith(
caches.match(event.request).then(cached=>{
if(cached)return cached;

return fetch(event.request).then(response=>{
const copy=response.clone();
caches.open(CACHE).then(cache=>cache.put(event.request,copy));
return response;
}).catch(()=>caches.match('./index.html'));
})
);
});