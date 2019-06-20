const DOMAIN = 'https://localhost:8080';
importScripts(`/modules/cacheLib.js`);

// =====================================================================================================================
// SW Versioning

// const SW_VERSION = 0;
const SW_VERSION = 1;

// =====================================================================================================================
// Global configs en initialization
const PREFIX = "PWA";
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

// =====================================================================================================================
// Event handling

self.addEventListener('install', (event) =>
{
	event.waitUntil(self.skipWaiting());
	if (SW_VERSION === 0)
		console.log("Install SW WITH SKIP & CLAIM A");
	else
		console.log("Install SW WITH SKIP & CLAIM B");

	const urls = [
		"/img/dog.png",
		"/img/cat.png",
		"/img/horse.png",
	];
	event.waitUntil(CacheLib.precacheAll(PRECACHE, urls));
});

self.addEventListener('activate', (event) =>
{
	event.waitUntil(self.clients.claim());
	// Clean up old cache versions
	if (SW_VERSION === 0)
		console.log("Activate SW WITH SKIP & CLAIM A");
	else
		console.log("Activate SW WITH SKIP & CLAIM B");
});

function t()
{
	if (SW_VERSION === 0)
		return CacheLib.getFromCache(PRECACHE, '/img/cat.png')
	else
		return CacheLib.getFromCache(PRECACHE, '/img/dog.png')
}

self.addEventListener('fetch', (event) =>
{
	console.log("SW WITH SKIP AND CLAIM FETCH: ", SW_VERSION);
	// Update
	if (event.request.url.match(/https:\/\/.*:8080\/img\/horse\.png/))
	{
		event.respondWith(t())
	}

});


