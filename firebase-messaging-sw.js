importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:"AIzaSyAn5qA1raLAvm3-h06UCicrHOG6lGHZ6KQ",
  authDomain:"yemen-mart-1bfac.firebaseapp.com",
  projectId:"yemen-mart-1bfac",
  appId:"1:702751338926:web:2ba0cabd27a6c986e9d83f",
  messagingSenderId:"702751338926"
});

const messaging=firebase.messaging();

/* ---------- الإشعارات ---------- */
// الرسائل تصل كبيانات (data) فقط، فنعرضها نحن ونتحكم بالضغط عليها
messaging.onBackgroundMessage(p=>{
  const d=p.data||{};
  return self.registration.showNotification(d.title||"سوق يمن مارت",{
    body:d.body||"",
    icon:"icon-192.png",
    badge:"icon-192.png",
    data:{url:d.url||"./"}
  });
});

self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const c of list){
      if(c.url.startsWith(self.registration.scope)&&"focus" in c){
        if("navigate" in c)c.navigate(url);
        return c.focus();
      }
    }
    return clients.openWindow(url);
  }));
});

/* ---------- التطبيق (PWA): تخزين الواجهة للفتح السريع ---------- */
const CACHE="ym-shell-v1";
const SHELL=["./","index.html","manifest.json","logo.png","icon-192.png"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// الشبكة أولاً (لتصلك التحديثات دائماً)، والنسخة المخزّنة عند انقطاع الإنترنت
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(
    fetch(r,{cache:"no-cache"})
      .then(res=>{
        if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
        return res;
      })
      .catch(()=>caches.match(r).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):null)||Response.error()))
  );
});
