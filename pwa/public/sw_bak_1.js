importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js");
importScripts(`/modules/cacheLib.js`);

// =====================================================================================================================
// Global configs en initialization
const SW_VERSION = 1;
const aggresiveUpdate = true;
const withClaim = true;
let mutex = new Mutex();

// =====================================================================================================================
if (workbox)
{
	// ---------------------------------------------------------------------------------------------------------------------
	// Workbox config 
	const RUNTIME = "runtime";
	workbox.core.setCacheNameDetails({ prefix: '', suffix: '', precache: RUNTIME, runtime: RUNTIME, });

	// ---------------------------------------------------------------------------------------------------------------------
	// Workbox precaching
	// const precacheController = new workbox.precaching.PrecacheController();

	let precacheList = [
		{
			"url": "/update.1.js",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/",
			"page": true,
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/about",
			"page": true,
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/products",
			"page": true,
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "manifest.json",
			"revision": "25f5327e40d877a9844153a000e205a6"
		},
		{
			"url": "index.html",
			"revision": "36f3cc0cbbc516ad23f4ea944d1b5c34"
		},
		{
			"url": "js/about.3bf34e5b.js",
			"revision": "65d804236b57b6c8c951d187cc4ffbec"
		},
		{
			"url": "js/about.3bf34e5b.js.map",
			"revision": "62078a53043c1c846be7bc85e4214755"
		},
		{
			"url": "js/app.29504a9d.js",
			"revision": "ea2e342ccdb798e44cd0592d1b306622"
		},
		{
			"url": "js/app.29504a9d.js.map",
			"revision": "15e7c8805917309b02b6b2e84b991e50"
		},
		{
			"url": "js/categories.f8facde1.js",
			"revision": "adfb84703f41afcbc40325c7443ddd71"
		},
		{
			"url": "js/categories.f8facde1.js.map",
			"revision": "4f2f2a31fbb0d7a9fe5a114e500de142"
		},
		{
			"url": "js/category.54dc8197.js",
			"revision": "70658bfb04737a883d774a0fb398fe56"
		},
		{
			"url": "js/category.54dc8197.js.map",
			"revision": "1129e80f8363a1b5cf3c91ec3334a802"
		},
		{
			"url": "js/chunk-vendors.df24b7ef.js",
			"revision": "cef061eb257bd0bd2dec65f80198e3d6"
		},
		{
			"url": "js/chunk-vendors.df24b7ef.js.map",
			"revision": "24996472ec48c6343726ccfa33a16268"
		},
		{
			"url": "js/product.a8136637.js",
			"revision": "c991c49f9c2c3e007f5f1c4db92d2ec6"
		},
		{
			"url": "js/product.a8136637.js.map",
			"revision": "858ec962bf0927f086b57e555b65c393"
		},
		{
			"url": "js/update.a4680289.js",
			"revision": "e23bd72ee6fd054b431a355b7710913e"
		},
		{
			"url": "js/update.a4680289.js.map",
			"revision": "c9285ab34e701d77caee7a67a9fc900b"
		},
		{
			"url": "js/updateLoader.84d03b7d.js",
			"revision": "b9acbb38cd57c6d4d67e484e81e9f923"
		},
		{
			"url": "js/updateLoader.84d03b7d.js.map",
			"revision": "b9ad0e183bf1980e4bca077db76b1242"
		},
		{
			"url": "css/app.6e9ef0ed.css",
			"revision": "14c700c093c53f3bf3381ccb2a30e25d"
		},
		{
			"url": "css/categories.27abadab.css",
			"revision": "77b3ad0589b2fd06db041e62f0bced13"
		},
		{
			"url": "css/category.a38e0ec4.css",
			"revision": "9ce3fff3b50ff8af1938b682c4833217"
		},
		{
			"url": "css/chunk-vendors.5f30ded4.css",
			"revision": "cd8079e2ee68017f057020259c73b4b9"
		},
		{
			"url": "css/product.104f8ece.css",
			"revision": "d59c28e41acccf693a616039ec0e3fe8"
		},
		{
			"url": "css/update.b30cc6de.css",
			"revision": "2e0beadc461d1ba8d7fb54410a7c4a10"
		},
		{
			"url": "img/cat.png",
			"revision": "786dd0e7a12d1c24a6a0585025e19bf5"
		},
		{
			"url": "img/cf.a2bf9946.svg",
			"revision": "a2bf99460d0c95e8f067783a74fb7359"
		},
		{
			"url": "img/cf.svg",
			"revision": "a2bf99460d0c95e8f067783a74fb7359"
		},
		{
			"url": "img/co.249d1a82.svg",
			"revision": "249d1a82f54c755fcc787a96278c3edc"
		},
		{
			"url": "img/co.svg",
			"revision": "249d1a82f54c755fcc787a96278c3edc"
		},
		{
			"url": "img/dog.png",
			"revision": "46ef9bf0b4eb6bd836dac3d40a6c6fc0"
		},
		{
			"url": "img/GoogleFont.css",
			"revision": "0613a3bb588d6a776445821718dd0a8d"
		},
		{
			"url": "img/horse.png",
			"revision": "b410828ebaac29b369bc6da8d018e57e"
		},
		{
			"url": "img/logo.63a7d78d.svg",
			"revision": "63a7d78d42c33b94fc7b957524795cac"
		},
		{
			"url": "img/nf.0a8650c6.svg",
			"revision": "0a8650c654061e221ad22d4ca96ff771"
		},
		{
			"url": "img/nf.svg",
			"revision": "0a8650c654061e221ad22d4ca96ff771"
		},
		{
			"url": "img/no.f8db81d5.svg",
			"revision": "f8db81d58c055a8052accd0aa5992006"
		},
		{
			"url": "img/no.svg",
			"revision": "f8db81d58c055a8052accd0aa5992006"
		},
		{
			"url": "img/product-placeholder.svg",
			"revision": "b66416d0ae2da2dcebc689c185d00f48"
		},
		{
			"url": "img/qhd.png",
			"revision": "3f074e8e24a803314ed28faed2851431"
		},
		{
			"url": "img/swr.4cc8edf4.svg",
			"revision": "4cc8edf4380fbc24ba702e3a6dc022c5"
		},
		{
			"url": "img/swr.svg",
			"revision": "4cc8edf4380fbc24ba702e3a6dc022c5"
		},
		{
			"url": "modules/cacheLib.js",
			"revision": "919c104483eda59192a0830201c7b571"
		},
		{
			"url": "modules/firebaseHelper.js",
			"revision": "d0829de4e86a7e53a015746170f6dabd"
		},
		{
			"url": "modules/firebaseInit.js",
			"revision": "a819f93df130eba5c23e361a690c68ed"
		},
		{
			"url": "modules/firebaseLib.js",
			"revision": "ce429d0a8593325a87046297726eedd3"
		},
		{
			"url": "modules/mutex.js",
			"revision": "b2e05282db36c168d28309e44ba14504"
		},
		{
			"url": "favicon.ico",
			"revision": "fe4792d482196a50cf9ae0d9d90b6493"
		},
		{
			"url": "robots.txt",
			"revision": "b6216d61c03e6ce0c9aea6ca7808f7ca"
		}
	]
	// precacheController.addToCacheList(precacheList);

	// ---------------------------------------------------------------------------------------------------------------------
	// Google fonts caching 

	// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
	workbox.routing.registerRoute(
		/^https:\/\/fonts\.googleapis\.com/,
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: 'google-fonts-stylesheets',
		})
	);

	// Cache the underlying font files with a cache-first strategy for 1 year.
	workbox.routing.registerRoute(
		/^https:\/\/fonts\.gstatic\.com/,
		new workbox.strategies.CacheFirst({
			cacheName: 'google-fonts-webfonts',
			plugins: [
				new workbox.cacheableResponse.Plugin({
					statuses: [0, 200],
				}),
				new workbox.expiration.Plugin({
					maxAgeSeconds: 60 * 60 * 24 * 365,
					maxEntries: 30,
				}),
			],
		})
	);

	// ---------------------------------------------------------------------------------------------------------------------
	// LocalForage 

	let localForage;
	localforage.setDriver([
		localforage.INDEXEDDB,
		localforage.WEBSQL,
		localforage.LOCALSTORAGE
	])
		.then(function ()
		{
			localforage.config({
				name: 'lf',
				version: 1.0,
				size: 4980736, // Size of database, in bytes. WebSQL-only for now.
				storeName: 'lf', // Should be alphanumeric, with underscores.
				description: 'some description'
			});
			localForage = localforage.createInstance({ name: "lf" });
		});

	// =====================================================================================================================
	// Event handling

	// ---------------------------------------------------------------------------------------------------------------------
	// Push

	self.addEventListener('push', function (event)
	{
		// Modify original push-event to circumvent bug in Firebase code
		// thanks to https://github.com/firebase/quickstart-js/issues/71
		let e = event;
		if (e.custom) return;

		// Create a new event to dispatch
		let newEvent = new Event('push');
		newEvent.waitUntil = e.waitUntil.bind(e);
		newEvent.data = {
			json: function ()
			{
				let newData = e.data.json();
				newData._notification = newData.notification;
				delete newData.notification;
				return newData;
			},
		};
		newEvent.custom = true;

		// Stop event propagation
		e.stopImmediatePropagation();

		// Dispatch the new wrapped event
		dispatchEvent(newEvent);
	});

	// ---------------------------------------------------------------------------------------------------------------------
	// Installation
	self.addEventListener('install', (event) =>
	{
		console.log("Start installation");
		event.waitUntil(CacheLib.smartPrecacheList(RUNTIME, precacheList));
		// event.waitUntil(precacheController.install());		

		if (aggresiveUpdate)
			self.skipWaiting();

		console.log("Stop installation");
	});

	// ---------------------------------------------------------------------------------------------------------------------
	// Activation
	self.addEventListener('activate', (event) =>
	{
		console.log("Start activation");
		// Clean up old cache versions
		event.waitUntil(activateCleanup())

		// event.waitUntil(precacheController.activate());
		if (withClaim)
			self.clients.claim();
		console.log("Stop activation");
	});

	async function activateCleanup()
	{
		let obsoleteList = await localForage.getItem("obsoleteList");
		if (obsoleteList == null)
			return;

		const release = await mutex.acquire();
		try
		{
			let cacheManagementRef = await localForage.getItem("cacheManagementRef").catch(error => { console.error(error); });
			cacheManagementRef = await CacheLib.smartMigrate(cacheManagementRef, RUNTIME);
			await localForage.setItem("cacheManagementRef", obsoleteList, cacheManagementRef);
			release();
		}
		catch
		{
			release();
		}
		localForage.removeItem("obsoleteList");
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Fetch

	self.addEventListener('fetch', (event) =>
	{
		event.respondWith(fetchHandler(event));
	});

	async function fetchHandler(event)
	{
		const requestURL = event.request.url;
		// const cacheKey = precacheController.getCacheKeyForURL(event.request.url);
		// if (cacheKey != null)
		// 	return await caches.match(cacheKey).then(response => { return response; });
		// else if (requestURL.startsWith('https://vuestorefront-demo.phpro.be/pub/media/catalog/product'))
		// {
		// 	await vsdemoMediaHandler(event)
		// }
		// else
		// {
		let a;
		if (requestURL.endsWith('/img/nf.0a8650c6.svg'))
			a = 0;
		else if (requestURL.endsWith('/img/no.f8db81d5.svg'))
			a = 0;
		else if (requestURL.endsWith('/img/cf.a2bf9946.svg'))
			a = 0;
		else if (requestURL.endsWith('/img/co.249d1a82.svg'))
			a = 0;
		else if (requestURL.endsWith('/img/swr.4cc8edf4.svg'))
			a = 0;
		else if (requestURL.startsWith('https://vuestorefront-demo.phpro.be/rest/V1/products'))
			a = 0;

		// ---------------------------------------------------------------------------------------------------------------------
		// Compute handle strategy
		let oldCacheBehaviour = await matchRequest(event);
		if (oldCacheBehaviour != null)
			console.log(`${oldCacheBehaviour}: ${requestURL}`);
		let response = await getResponse(event, oldCacheBehaviour);
		if (response)
		{
			let cacheBehaviour = await getCacheBehaviourFromResponse(response.clone());

			// ---------------------------------------------------------------------------------------------------------------------
			// Update cache & cache bookkeeping

			// Update cache 
			await CacheLib.updateCacheBasedOnBehaviour(event.request.clone(), response.clone(), cacheBehaviour, RUNTIME);

			// Update cache bookkeeping

			// Use mutex to prevent race conditions when checking out cache bookkeeping 
			// from IndexedDB between multiple incoming requests
			// TODO: Better mutex handling to prevent deadlocks on errors 
			const release = await mutex.acquire();
			try
			{
				await CacheLib.updateCacheManagementBasedOnBehaviour(requestURL, oldCacheBehaviour, cacheBehaviour);
				release();
			}
			catch
			{
				release();
			}
			return response;
		}
		return new Response("404", { status: 404 });
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Message

	self.addEventListener('message', async function (event)
	{
		if (event.data && event.data.action && event.data.action === 'skipWaiting')
		{
			console.log("Waiting worker is skipping");
			self.skipWaiting()
		} else if (event.data && event.data.action && event.data.action === 'SW')
		{
			console.log("Returning SW Version");
			event.ports[0].postMessage(SW_VERSION);
		} else if (event.data && event.data.action && event.data.action === 'claim')
		{
			console.log("New activated worker is claiming");
			self.clients.claim();
		} else if (event.data && event.data.action && event.data.action === 'updateIfSingleClient')
		{
			let waiting = self.registration.waiting;
			let clientsAmt = (await self.clients.matchAll()).length;
			if (waiting && clientsAmt < 2)
			{
				event.ports[0].postMessage("UPDATE");
				self.registration.waiting.postMessage({ action: 'skipWaiting' });
			} else
			{
				event.ports[0].postMessage("NO UPDATE");
			}
		}

		if (event.data && event.data.cookie)
		{
			setCookie(event.data.cookie);
		}
	});

	// =====================================================================================================================
	// Helper functions

	function findUrlIndexDB(url, indexDB)
	{
		let entries = indexDB.cf.entries;
		for (let i = 0; i < entries.length; ++i)
		{
			if (url.endsWith(entries[i]))
				return 'cf';
		}
		entries = indexDB.co.entries;
		for (let i = 0; i < entries.length; ++i)
		{
			if (url.endsWith(entries[i]))
				return 'co';
		}
		entries = indexDB.nf.entries;
		for (let i = 0; i < entries.length; ++i)
		{
			if (url.endsWith(entries[i]))
				return 'nf';
		}
		entries = indexDB.no.entries;
		for (let i = 0; i < entries.length; ++i)
		{
			if (url.endsWith(entries[i]))
				return 'no';
		}
		entries = indexDB.swr.entries;
		for (let i = 0; i < entries.length; ++i)
		{
			if (url.endsWith(entries[i]))
				return 'swr';
		}
		return null;
	}

	async function matchRequest(event)
	{
		let url = event.request.url;
		let cookies = await localForage.getItem("cookies").catch(err => console.log("SW Cookie Error", err));


		let cacheManagementRef = await localForage.getItem("cacheManagementRef");
		let strategy = findUrlIndexDB(url, cacheManagementRef);

		return strategy;
	}

	

	async function getResponse(event, strategy)
	{
		if (strategy === 'cf')
		{
			return await CacheLib.cacheFirstStrategy(event.request, RUNTIME);
		}
		else if (strategy === 'co')
		{
			return await CacheLib.cacheOnlyStrategy(event.request, RUNTIME);
		}
		else if (strategy === 'nf')
		{
			return await CacheLib.networkFirstStrategy(event.request, RUNTIME);
		}
		else if (strategy === 'no')
		{
			return await fetch(event.request, { credentials: 'include' });
		}
		else if (strategy === 'swr')
		{
			return await fetch(event.request, { credentials: 'include' });
		}
		else
		{
			return await fetch(event.request, {
				credentials: 'omit', mode: 'cors'
			}).catch(err => console.error(err));
		}
	}

	async function getCacheBehaviourFromResponse(response)
	{
		for (var header of response.headers)
		{
			if (header[0] === 'x-cb')
			{
				return header[1];
			}
		}
	}

	async function vsdemoMediaHandler(event)
	{

		/* let cacheFirstHandler = new workbox.strategies.CacheFirst(); */
		// let resp = await cacheFirstHandler.handle(event);
		return await CacheLib.cacheFirstStrategy(event.request, RUNTIME);
	}

	function t()
	{
		if (SW_VERSION === 0)
			return CacheLib.getFromCache(PRECACHE, '/img/cat.png');
		else
			return CacheLib.getFromCache(PRECACHE, '/img/dog.png');
	}

	async function _FetchUpdateJSHandler(request)
	{

		let jsonHeaders = {};

		let newRequestHeaders = new Headers();
		for (header of request.headers)
		{
			jsonHeaders[header[0]] = header[1];
			newRequestHeaders.append(header[0], header[1]);
		}
		let cookie = await localforage.getItem("cookie");
		return localforage.getItem("cookie")
			.then(response =>
			{
				cookie = response;
				console.log("COOKIE FROM LOCALFORAGE: ", cookie);
				newRequestHeaders.append("Cookie", cookie);
				newRequestHeaders.append("X-Cookie", cookie);
				jsonHeaders["Cookie"] = cookie;
				jsonHeaders["X-Cookie"] = cookie;
				console.log(cookie);

				let newRequest = new Request(request.url,
					{
						method: 'GET',
						mode: 'cors',
						credentials: 'same-origin',
						headers: newRequestHeaders
					}
				);

				console.log("OLD request headers");
				CacheLib._printRequestHeaders(request);
				console.log("NEW request headers");
				CacheLib._printRequestHeaders(newRequest);

				// return CacheLib.networkFirst(PRECACHE, newRequest, true)
				//                .then(response =>
				//                      {return response})

				// return fetch(request.url, {
				//                  method: request.method,
				//                  mode: 'cors',
				//                  cache: request.cache,
				//                  credentials: 'same-origin',
				//                  headers: jsonHeaders,
				//                  redirect: request.redirect,
				//                  referrer: request.referrer
				//              }
				// )
				return fetch(newRequest)
					.then(response =>
					{
						CacheLib._printResponseHeaders(response);
						// CacheLib.addToCache(newRequest, response.clone(), PRECACHE);
						return response;
					});
			});
	}

	function fetch3rd(request)
	{
		let requestClone = request;
		return fetch(request, {})
			.then(response =>
			{
				let responseClone = response.clone();
				console.log(response);
				for (header of response.headers)
				{
					console.log(`Name: ${header[0]}, Value:${header[1]}`);
				}
				CacheLib.addToCache(requestClone, responseClone, PRECACHE);
				return response;
			})
	}

	function parseCacheControl(cacheControlHeader)
	{
		let splitCacheControl = cacheControlHeader.split(',');
		let response = {
			cacheability: "public",
			expiration: "",
			validation: ""
		};
		for (let elem of splitCacheControl)
		{
			if (elem === "no-cache" || elem === "no-store")
			{
				response.cacheability = elem;
			} else if (elem.startsWith("max-age"))
			{
				response.expiration = elem;
			} else if (elem === "must-revalidate")
			{
				response.validation = elem;
			}

		}
		return response;
	}

	function cacheValidationHandler(request, parsedHeaders)
	{
		let newRequestHeaders = new Headers(request.headers);
		if (parsedHeaders["etag"] != null)
			newRequestHeaders.append("If-None-Match", parsedHeaders["etag"]);
		if (parsedHeaders["last-modified"] != null)
			newRequestHeaders.append("If-Modified-Since", parsedHeaders["last-modified"]);

		return new Request(request, {
			mode: 'cors',
			credentials: 'omit',
			headers: newRequestHeaders
		});

	}

	async function maxAgeHandler(request, parsedHeaders)
	{
		let maxAge = parseInt(parsedHeaders["cache-control"].expiration.slice(8));
		let newDate = new Date(parsedHeaders["date"].getTime());
		newDate.setSeconds(newDate.getSeconds() + maxAge);
		let now = new Date();


		let cookie = await localforage.getItem("cookie");
		let previousCookie = await localforage.getItem("previousCookie");

		if (newDate > now && previousCookie === cookie)
		{
			return null;
		} else
		{
			if (previousCookie !== cookie)
			{
				localforage.setItem("previousCookie", cookie);
			}
			return cacheValidationHandler(request, parsedHeaders);
		}
	}

	async function responseHandler(request, cachedResponse, parsedHeaders)
	{
		if (parsedHeaders["cache-control"].cacheability === "no-store")
		{
			return fetch(request)
				.then(response =>
				{ return response; });
		} else if (parsedHeaders["cache-control"].cacheability === "no-cache")
		{

			const newRequest = cacheValidationHandler(request, parsedHeaders);
			return fetch(newRequest)
				.then(response =>
				{
					CacheLib.addToCache(request, response.clone(), RUNTIME);
					return response;
				});
		} else if (parsedHeaders["cache-control"].expiration.startsWith("max-age="))
		{
			const newRequest = await maxAgeHandler(request, parsedHeaders);
			if (newRequest == null)
				return cachedResponse;
			return fetch(newRequest)
				.then(response =>
				{
					CacheLib.addToCache(request, response.clone(), RUNTIME);
					return response;
				});
		}
	}

	async function parseRequestForCookies(request)
	{
		let requestWithCookieHeaders = new Headers();
		let cookie = await localforage.getItem("cookie");
		// if (cookie != null)
		// { requestWithCookieHeaders.append("cookie", cookie); }
		const requestWithCookie = new Request(request, {
			mode: 'cors',
			credentials: 'omit',
			headers: requestWithCookieHeaders
		});
		for (let header of requestWithCookieHeaders)
		{
			console.log(header);
		}
		return requestWithCookie;
	}

	function respondToApi(request)
	{
		return parseRequestForCookies(request)
			.then(requestWithCookie =>
			{
				return caches.match(requestWithCookie)
					.then((response) =>
					{
						console.log("Cached response: ", response);
						let responseHeaders = {};
						if (response != null)
						{
							responseHeaders['date'] = new Date(response.headers.get("date"));
							responseHeaders['etag'] = response.headers.get("etag");
							let cacheControl = response.headers.get("cache-control");
							responseHeaders['last-modified'] = response.headers.get("last-modified");
							if (cacheControl != null)
							{

								responseHeaders['cache-control'] = parseCacheControl(cacheControl);
								return responseHandler(request, response, responseHeaders);
							} else
								response = null;
						}

						if (response == null)
						{
							return fetch(request)
								.then(response =>
								{
									console.log("Network response: ", response);
									CacheLib.addToCache(request, response.clone(), RUNTIME);
									return response;
								});
						}
					});
			})
	}

	async function respondToIndex(request)
	{
		if (navigator.onLine)
		{
			try
			{

				return await fetch(request)
					.then(response =>
					{
						console.log("Network response: ", response);
						// CacheLib.deleteFromCache(request, RUNTIME);
						CacheLib.addToCache(request, response.clone(), RUNTIME);
						return response;
					})
			} catch (e)
			{
				return await CacheLib.matchCache(request);
			}
		} else
		{
			return await CacheLib.matchCache(request);
		}
	}

	async function similarityTest(oldRequest)
	{
		let buh = await localForage.getItem("buh");
		let request = new Request(oldRequest);
		request.headers.append("X-X", buh);
		return caches.open(RUNTIME)
			.then(async cache =>
			{
				let cachedResponse = cache.match(request);
				return cachedResponse.then(response =>
				{
					for (let header of request.headers)
						console.log(header);
					console.log(response);
					if (response)
						return response;
					else
					{
						return fetch(request)
							.then(newResponse =>
							{

								CacheLib.addToCache(request.clone(), newResponse.clone(), RUNTIME);
								return newResponse
							})
					}
				})
					.catch(error => console.error(error));
			});
	}

	async function updateResponse()
	{
		// self.skipWaiting();
		return new Response("", { headers: { "Refresh": "0" } });
	}

	async function updateTest()
	{
		let waiting = self.registration.waiting;
		let clientsAmt = (await self.clients.matchAll()).length;
		return { waiting: waiting, clientsAmt: clientsAmt };
	}

	async function checkForUpdate(request)
	{
		let waiting = self.registration.waiting;
		let clientsAmt = (await self.clients.matchAll()).length;

		if (request.mode === "navigate" &&
			request.method === "GET" &&
			waiting &&
			clientsAmt < 2)
		{
			event.respondWith(updateResponse());

		}
	}



	async function updateH(event)
	{
		console.log("HANDLING UPDATE.JS");
		let newRequest = new Request(event.request);
		newRequest.headers.set("Cache-Control", "max-age=0");
		let cachedResponse = await CacheLib.getFromCache(RUNTIME, newRequest.url);
		if (cachedResponse)
		{

			for (let h of cachedResponse.headers)
			{ console.log(h); }
			let response = await CacheLib._fetchRequest(newRequest)
				.then(result => { return result.response; });
			return cachedResponse;
		}
		let response = await CacheLib._fetchRequest(newRequest)
			.then(result => { return result.response; });
		if (response)
		{
			let newResponse = new Response(response);
			newResponse.headers.set("Cache-Control", "no-store");
			for (let h of newResponse.headers)
			{ console.log(h); }
			CacheLib.addToCache(newRequest.clone(), newResponse.clone(), RUNTIME);
			return newResponse;
		}
	}

	async function imgProduct(event)
	{

		let response = await CacheLib._fetchRequest(event.request)
			.then(result => { return result.response; });
		if (response)
		{
			let newResponse = new Response(response);
			newResponse.headers.set("Cache-Control", "no-store");
			for (let h of newResponse.headers)
			{ console.log(h); }
			return newResponse;
		} else
		{
			return await CacheLib.getFromCache(RUNTIME, "/img/product-placeholder.svg");
		}
	}

	async function setCookie(newCookie)
	{
		cookie = newCookie;
		let previousCookie = await localforage.getItem("cookie");
		if (previousCookie !== cookie)
		{
			localforage.setItem("cookie", cookie)
				.catch((error) =>
				{
					console.error("LocalForage: ", error)
				});
			localforage.setItem("previousCookie", previousCookie)
				.catch((error) =>
				{
					console.error("LocalForage: ", error)
				});
		}
	}


	function checkMaxAge(response)
	{
		let requestDate = new Date(response.headers.get("date"));
		const cacheControl = response.headers.get("cache-control");
		console.log(cacheControl);

		return !checkNetworkFirst(respones);
		let responseMaxAge = response.headers.get("cache-control")
			.slice(8);
		let expireDate = requestDate.setSeconds(requestDate.getSeconds() + responseMaxAge);
		let now = new Date();
		if (expireDate > now)
			return true;
		else
			return false;
	}

	function checkNetworkFirst(response)
	{
		const cacheControl = response.headers.get("cache-control");
		if (cacheControl === 'no-cache')
			return true;
		return false;
	}

	async function matchNetworkFirstFuntion(url, event)
	{
		if (url.href !== '/update.js')
			return false;
		let request = event.request.clone();
		let response = await CacheLib.getFromCache(RUNTIME, request);
		let response2 = await cccccc(request);
		// let c = workbox.precaching.getCacheKeyForURL('https://pwa.local:8080/update.js');
		if (response == null)
			return true;
		return checkNetworkFirst(response);
	}

	async function cccccc(url)
	{
		return await caches.match(url, { RUNTIME });
	}

	async function matchCacheFirstFuntion(url, event)
	{
		if (url.href !== '/update.js')
			return false;
		let request = event.request.clone();
		let response = await CacheLib.getFromCache(RUNTIME, request);
		let response2 = await cccccc(request.url);
		if (response == null)
			return true;
		return checkMaxAge(response);
	}
} else
{
	console.error(`Boo! Workbox didn't load 😬`);
}