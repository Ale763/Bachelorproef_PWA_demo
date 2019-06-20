const DOMAIN = 'https://localhost:8080';
importScripts(`/modules/cacheLib.js`);
// importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js");

// =====================================================================================================================
// SW Versioning

let SW_VERSION = 0;
// const SW_VERSION = 1;

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
		console.log("Install SW WITH SKIP A");
	else
		console.log("Install SW WITH SKIP B");

	const urls = [
		"/img/dog.png",
		"/img/cat.png",
		"/img/horse.png",
	];
	event.waitUntil(CacheLib.precacheAll(PRECACHE, urls));
});

self.addEventListener('activate', (event) =>
{
	// Clean up old cache versions
	if (SW_VERSION === 0)
		console.log("Activate SW WITH SKIP A");
	else
		console.log("Activate SW WITH SKIP B");
	// if (withClaim)
	// 	self.clients.claim();
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
	// console.log("SW WITH SKIP FETCH: ", SW_VERSION);
	// Update
	if (event.request.url.match(/https:\/\/.*:8080\/img\/horse\.png/))
	{
		// event.waitUntil(SWVersionHandler());
		event.respondWith(t())
	}

});
