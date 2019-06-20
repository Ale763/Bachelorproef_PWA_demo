const DOMAIN = 'https://localhost:8080';
importScripts(`/modules/cacheLib.js`);
// importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js");

// =====================================================================================================================
// SW Versioning

// let SW_VERSION = 0;
const SW_VERSION = 1;

// =====================================================================================================================
// Global configs en initialization
const PREFIX = "PWA";
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

// =====================================================================================================================
// Event handling

// ---------------------------------------------------------------------------------------------------------------------
// Installation
self.addEventListener('install', (event) =>
{
	// event.waitUntil(self.skipWaiting());
	if (SW_VERSION === 0)
		console.log("Install - single client update");
	else
		console.log("Install - single client update");

	const urls = [
		"/img/dog.png",
		"/img/cat.png",
		"/img/horse.png",
	];
	event.waitUntil(CacheLib.precacheAll(PRECACHE, urls));
	event.waitUntil(inst("/img/cat.png"));
	event.waitUntil(inst("/img/dog.png"));
	event.waitUntil(inst("/img/horse.png"));
});

async function inst(url)
{
	let request = new Request(url);
	let response = await fetch(request.clone());
	CacheLib.addToCache(request, response, PRECACHE)
}

// ---------------------------------------------------------------------------------------------------------------------
// Activation
self.addEventListener('activate', (event) =>
{
	// Clean up old cache versions
	// console.log("Start activation...")
	event.waitUntil(longActivate());
	// event.waitUntil(migrate(event));
	// event.waitUntil(self.clients.claim());
	// console.log("Activation ended");
});

function migrate() 
{
	return new Promise(async function (resolve, reject) 
	{
		// console.log("Activation - migration start...");
		if (SW_VERSION === 0)
		{
			let response = await CacheLib.getFromCache(PRECACHE, "/img/cat.png")
				.catch(error => 
				{
					console.error(error)
					reject(error);
				});
			await CacheLib.addToCache(new Request("/img/horse.png"), response, RUNTIME);
		}
		else
		{
			let response = await CacheLib.getFromCache(PRECACHE, "/img/dog.png")
				.catch(error => 
				{
					console.error(error)
					reject(error);
				});
			await CacheLib.addToCache(new Request("/img/horse.png"), response, RUNTIME);
		}
		// console.log("V", SW_VERSION);
		// console.log("Activation - migration ended");
		resolve("Activation - migration ended");
	});

}

async function longActivate()
{
	// console.log("Start activation...")
	self.clients.claim();

	// console.log("Start busy waiting");
	for (i = 0; i < 1000; ++i)
	{
		await migrate();
	}
	// console.log("End of busy waiting");


	// let activateDate = new Date();
	// console.log("Activation ended - ", activateDate.getTime());
}

// ---------------------------------------------------------------------------------------------------------------------
// Fetch
self.addEventListener('fetch', async (event) =>
{
	// let d = new Date();
	// console.log(`V${SW_VERSION}: ${event.request.url} - ${d.getTime()}`);
	let navigateMode = event.request.mode === "navigate";
	let requestMethod = event.request.method === "GET";
	let swWaiting = registration.waiting;
	if (event.request.mode === "navigate" && event.request.method === "GET"
		&& swWaiting)
	{
		event.respondWith(update(event));
	}
	else if (event.request.url.match(/https:\/\/.*:8080\/img\/horse\.png/))
	{
		event.respondWith(t())
	}

});

async function t()
{
	let runtime = RUNTIME
	return await caches.open(RUNTIME).then(cache => 
	{
		return cache.match(new Request("/img/horse.png"));
	}).catch(error => console.log(error));
}

async function update(event)
{
	if ((await clients.matchAll()).length < 2)
	{
		registration.waiting.postMessage({ action: 'skipWaiting' });
		let response = await fetch('loader.html');
		let clonedResponse = await response.text();
		let init = {
			status: response.status,
			statusText: response.statusText,
			headers: { 'Refresh': '0' }
		};
		response.headers.forEach(function (v, k)
		{
			init.headers[k] = v;
		});
		let newResponse = new Response(clonedResponse, init);
		return newResponse;

	} else
	{
		return await caches.match(event.request) ||
			fetch(event.request);
	}
}

// ---------------------------------------------------------------------------------------------------------------------
// Messaging
self.addEventListener('message', async function (event)
{
/* 	console.log("My ID: ", SW_VERSION);
	console.log("Incoming message: ", JSON.stringify(event.data)); */

	if (event.data && event.data.action)
	{
		if (event.data.action === 'skipWaiting')
		{
			// console.log("Waiting worker is skipping");
			self.skipWaiting();
		} else if (event.data.action === 'getClients')
		{
			let lastRemainingClient = await clients.matchAll().length < 2;
			event.ports[0].postMessage({ "lastRemainingClient": lastRemainingClient });
		}
	}

});
