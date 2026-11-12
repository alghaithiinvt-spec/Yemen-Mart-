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

// الرسائل تصل كبيانات (data) فقط، فنعرضها نحن ونتحكم بالضغط عليها
messaging.onBackgroundMessage(p=>{
  const d=p.data||{};
  return self.registration.showNotification(d.title||"سوق يمن مارت",{
    body:d.body||"",
    icon:"icon-192.png",
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
