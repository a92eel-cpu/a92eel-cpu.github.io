/* ميزان service worker: app shell offline, network-first for the page */
const V='mizan-v3.1.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./vendor/supabase.js','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./fonts/plex-arabic-400.woff2','./fonts/plex-arabic-500.woff2','./fonts/plex-arabic-600.woff2','./fonts/plex-arabic-700.woff2','./fonts/plex-latin-400.woff2','./fonts/plex-latin-500.woff2','./fonts/plex-latin-600.woff2','./fonts/plex-latin-700.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mizan-')&&k!==V&&k!==V+'-x').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'){
      e.respondWith((async()=>{
        try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);const res=await fetch(r,{signal:ctl.signal});clearTimeout(t);
          if(res&&res.ok){const c=await caches.open(V);c.put('./index.html',res.clone());}return res;}
        catch(err){return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error();}
      })());
      return;
    }
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;})));
    return;
  }
  if(/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(V+'-x').then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;}));
  }
});
