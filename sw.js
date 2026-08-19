const CACHE = 'wwapp-v2';
const SHELL = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './assets/简洁的圆形用户头像占位图_文玩主题_米白色背景上放一枚精致的_2026-08-12T05-09-24.png',
  './assets/人手盘玩文玩核桃的特写_手持两枚核桃在掌心转动_核桃表面红润_2026-08-14T03-37-55.png',
  './assets/一对白狮子文玩核桃特写_皮质厚实_纹理清晰_红润包浆感_暖黄_2026-08-14T03-37-38.png',
  './assets/真实感产品照片_一串紫红色小叶紫檀手串_摆放在米白色亚麻布上_2026-08-12T03-43-26.png',
  './assets/真实感产品照片_一对文玩核桃_狮子头__表面有自然包浆光泽__2026-08-12T03-43-25.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => {
      if (r) return r;
      return fetch(e.request).then(res => {
        const cp = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
