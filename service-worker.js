// Retire the previous React site's offline worker after the static-site migration.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('workbox-precache-') || key === 'images')
      .map(key => caches.delete(key)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    await Promise.all(windows.filter(client => client.url.startsWith(self.registration.scope))
      .map(client => client.navigate(client.url)));
  })());
});
