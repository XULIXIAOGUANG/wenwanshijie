const CACHE = 'wwapp-v4';
const SHELL = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
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

// 导航请求：网络优先 —— 联网时强制拿服务器最新文件，失败/离线才回退缓存（保证更新能生效且离线可用）
function networkFirst(req) {
  return fetch(req, { cache: 'no-store' })
    .then(res => {
      if (!res || !res.ok) throw new Error('network error');
      const cp = res.clone();
      caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {});
      return res;
    })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html')));
}

// 静态资源：缓存优先 + 后台静默更新（秒开体验，同时让新资源最终生效）
function staleWhileRevalidate(req) {
  return caches.match(req).then(cached => {
    const net = fetch(req)
      .then(res => {
        if (res && res.ok) {
          const cp = res.clone();
          caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {});
        }
        return res;
      })
      .catch(() => cached);
    return cached || net;
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // file://（桌面 Electron 用 loadFile 加载）与 app:// 协议下 SW 无法 fetch，直接放行交给浏览器默认处理，
  // 否则 respondWith(fetch(file://请求)) 会收到非 Response 对象，导致整页导航 ERR_FAILED 白屏。
  if (e.request.url.indexOf('file:') === 0 || e.request.url.indexOf('app:') === 0) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(networkFirst(e.request));
    return;
  }
  e.respondWith(staleWhileRevalidate(e.request));
});
