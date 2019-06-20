importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js");
importScripts(`/modules/cacheLib.js`);

// =====================================================================================================================
// Global configs en initialization
const DOMAIN = "https://pwa.local:8080/";
const DOMAIN_REGEX = "^https:\\/\\/pwa\\.local:8080\\/";
const PRODUCT_CACHE = 'products';
const PRODUCT_CACHE_LIMIT = 2;
let productCacheMutex = new Mutex();

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
			"url": "/category/",
			"urlIsDynamic": true,
			"urlPattern": "category\/[^?]+\??.*?$",
			"template": 'https://pwa.local:8080/category/Women-Tops',
			"cacheBehaviour": 'nf',
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/category/Women-Tops",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/category/Men-Bottoms",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/category/Men-Accessoires",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/product/",
			"urlIsDynamic": true,
			"urlPattern": "product\/{[^?]+}{\?.*}?$",
			"template": 'https://pwa.local:8080/product/MA01',
			"cacheBehaviour": 'nf',
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/product/MA01",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/api/product/",
			"urlIsDynamic": true,
			"urlPattern": "https://pwa.local:8080/api/product\/{[^?]+}{\?.*}?$",
			"template": 'api/product/MA01',
			"cacheBehaviour": 'custom',
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/api/products/",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/settings",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "/offline",
			"revision": "25f5327e40d877a98k4153a000e205a6"
		},
		{
			"url": "manifest.json",
			"revision": "071f2118e4396a9e6eacb1546dfdb115"
		},
		{
			"url": "index.html",
			"revision": "b46275ee5a39e50ecb15a02b2039462c"
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
			"url": "js/app.ed8c0a19.js",
			"revision": "88908960ca5592bb8bfeafd9bafe45c0"
		},
		{
			"url": "js/app.ed8c0a19.js.map",
			"revision": "6e7777e5374a635f5db02aa898de12ff"
		},
		{
			"url": "js/categories.e17e5d19.js",
			"revision": "ae19b495c3ac9665eb991b521b69f898"
		},
		{
			"url": "js/categories.e17e5d19.js.map",
			"revision": "4babb551f3e245b66bd457799e4f87a8"
		},
		{
			"url": "js/category.dceac252.js",
			"revision": "fc1db354e07c78dcb2d344086a862d69"
		},
		{
			"url": "js/category.dceac252.js.map",
			"revision": "6d5d5f1762f8c0c5a95dc670ea32d453"
		},
		{
			"url": "js/chunk-vendors.665e8375.js",
			"revision": "737f290fc8a3ceb60226e2db1561b8ff"
		},
		{
			"url": "js/chunk-vendors.665e8375.js.map",
			"revision": "ea0dbc02c95d937afef9997bc3ce1027"
		},
		{
			"url": "js/offline.f8bfec44.js",
			"revision": "4e946c95a18f806fdcd0fa454fcd8739"
		},
		{
			"url": "js/offline.f8bfec44.js.map",
			"revision": "2aebfd5060b02a3847b438283aeee0f6"
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
			"url": "js/settings.4e6a7735.js",
			"revision": "5ba1f9f84984fc5d829f123733e0f606"
		},
		{
			"url": "js/settings.4e6a7735.js.map",
			"revision": "3019135dc060d5e3c01c9c960a4c8fe8"
		},
		{
			"url": "js/update.bed563ac.js",
			"revision": "c792ec3ad5477dc007a435dba32663b4"
		},
		{
			"url": "js/update.bed563ac.js.map",
			"revision": "ac4d3f1089a941722ac7c4e8a8e8cb28"
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
			"url": "css/app.54a26fad.css",
			"revision": "14c700c093c53f3bf3381ccb2a30e25d"
		},
		{
			"url": "css/categories.44890468.css",
			"revision": "de4181ab69d0ad1e3f1abd431bb94644"
		},
		{
			"url": "css/category.c5ea35c3.css",
			"revision": "93100852d532d29fa2f69de97866c897"
		},
		{
			"url": "css/chunk-vendors.af4acefe.css",
			"revision": "903793235d78d80cfe6149a55faaaa69"
		},
		{
			"url": "css/product.104f8ece.css",
			"revision": "d59c28e41acccf693a616039ec0e3fe8"
		},
		{
			"url": "css/settings.f94e5f18.css",
			"revision": "9d6232dc5301ba780c671cd11908eff2"
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
			"url": "img/cf.svg",
			"revision": "a2bf99460d0c95e8f067783a74fb7359"
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
			"url": "img/nf.svg",
			"revision": "0a8650c654061e221ad22d4ca96ff771"
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
			"url": "img/swr.svg",
			"revision": "4cc8edf4380fbc24ba702e3a6dc022c5"
		},
		{
			"url": "modules/cacheLib.js",
			"revision": "7ade4cfb9f1d25f0feff64806b2d9b25"
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
			"revision": "cba819fbdc44d2c18cdd943824a1d886"
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
	localforage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE])
		.then(function ()
		{
			localforage.config({ name: 'lf', version: 1.0, size: 4980736, storeName: 'lf', description: 'some description' });
			localForage = localforage.createInstance({ name: "lf" });
		});

	// =====================================================================================================================
	// Event handling

	// ---------------------------------------------------------------------------------------------------------------------
	// Installation
	self.addEventListener('install', (event) =>
	{
		console.log("Start installation");
		event.waitUntil(CacheLib.smartPrecacheList(RUNTIME, precacheList));
		// event.waitUntil(precacheController.install());		

		event.waitUntil(loadProductCachePolicy())
		if (aggresiveUpdate)
			self.skipWaiting();

		console.log("Stop installation");
	});

	async function loadProductCachePolicy()
	{
		let productCachePolicy = await localForage.getItem('productCachePolicy');
		if (productCachePolicy == null)
			await localForage.setItem("productCachePolicy", "none");
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Activation
	self.addEventListener('activate', (event) =>
	{
		console.log("Start activation");
		event.waitUntil(self.clients.claim());
		// Clean up old cache versions
		event.waitUntil(activateCleanup())

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
			cacheManagementRef = await CacheLib.smartMigrate(cacheManagementRef, obsoleteList, RUNTIME);
			await localForage.setItem("cacheManagementRef", cacheManagementRef);
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
		if (event.request.url !== "https://fcm.googleapis.com/fcm/connect/subscribe" && event.request.method == 'GET')
			event.respondWith(fetchHandler(event));
	});

	async function fetchHandler(event)
	{
		const requestURL = event.request.url;
		// Handle SW-Side API
		if (requestURL.endsWith("/sw/productCachePolicy"))
		{
			if (event.request.method === 'GET')
			{
				let productCachePolicy = await localForage.getItem("productCachePolicy");
				let data = { policy: productCachePolicy };

				return CacheLib.createJSONResponse(data);
			}
		}
		// ---------------------------------------------------------------------------------------------------------------------
		// Compute handle strategy
		let behaviourAndUrl = await matchRequest(event);
		let oldCacheBehaviour = behaviourAndUrl.cacheBehaviour;
		let request = new Request(behaviourAndUrl.url);
		let response = await getResponse(request, oldCacheBehaviour);
		dynamicProductCacheHandler(event.request.url);
		if (CacheLib.checkValidResponse(response))
		{
			let cacheBehaviour = await CacheLib._getCacheBehaviourFromResponse(response.clone());
			await _safeCacheManagementUpdate(requestURL, oldCacheBehaviour, cacheBehaviour);
			return response;
		}
		return Response.redirect("https://pwa.local:8080/offline");
		// let resp = await CacheLib.getFromCache(RUNTIME, new Request("https://pwa.local:8080/offline"));
		// if (resp) return resp;
		return new Response("404", { status: 404 });
	}

	async function getUserCookie()
	{
		let cookies = await localForage.getItem('UserCookie');
		if (cookies)
		{
			for (let cookie of cookies)
			{
				if (cookie[0] === 'User')
					return cookie[1];
			}
			return "0";
		}
		return "0";
	}

	async function getNotificationCookie()
	{
		let cookies = await localForage.getItem('NotificationConfigCookie');
		if (cookies)
		{
			for (let cookie of cookies)
			{
				if (cookie[0] === 'notificationConfig')
					return cookie[1];
			}
			return "default";
		}
		return "default";
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Message

	self.addEventListener('message', async function (event)
	{
		if (event.data && event.data.action && event.data.action === 'skipWaiting')
		{
			self.skipWaiting()
		}
		else if (event.data && event.data.action && event.data.action === 'setUserCookie')
		{
			if (event.data.cookies)
			{
				localForage.setItem("UserCookie", event.data.cookies);
				// Normally only the prices should be updated, but because of time limitations
				//  the whole catalog was replaced with correct prices for the given user
				CacheLib.networkFirstStrategy(new Request('/api/products/'), RUNTIME, { credentials: 'include' });
			}
		}
		else if (event.data && event.data.action && event.data.action === 'setNotificationConfigCookie')
		{
			if (event.data.cookies)
			{
				localForage.setItem("NotificationConfigCookie", event.data.cookies);
			}
		}
		else if (event.data && event.data.action && event.data.action === 'updateProductCachePolicy')
		{
			if (event.data.policy)
			{
				localForage.setItem("productCachePolicy", event.data.policy);
				await _emptyProductCache();
			}
		}
		else if (event.data && event.data.action && event.data.action === 'SW')
		{
			event.ports[0].postMessage(SW_VERSION);
		} else if (event.data && event.data.action && event.data.action === 'claim')
		{
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

	});

	// =====================================================================================================================
	// Helper functions

	async function dynamicProductCacheHandler(requestURL)
	{
		let prefix = "https://pwa.local:8080/product/";
		let productCachePolicy = await localForage.getItem("productCachePolicy");
		if (requestURL.startsWith(prefix))
		{
			if (productCachePolicy === "none" || productCachePolicy === null)
			{
				return
			}
			else if (productCachePolicy === "history") 
			{
				return dynamicHistoryHandler(requestURL);
			}
			else if (productCachePolicy === "predictive")
			{
				return dynamicPredictiveHandler(requestURL);
			}
		}
		return;
	}

	async function dynamicPredictiveHandler(requestURL)
	{
		let prefix = "https://pwa.local:8080/product/";
		// Get product sku
		let queryIndex = requestURL.indexOf("?");
		let sku;
		if (queryIndex !== -1)
			requestURL = requestURL.slice(0, queryIndex);

		sku = requestURL.slice(prefix.length);
		if (sku !== 'PA01') return;

		let cache = await caches.open(PRODUCT_CACHE);

		// Cache main resource: PA01
		let productRequest = await _getProductMediaRequest(sku);
		let productResponse = await _getProductMediaResponse(productRequest);
		await cache.put(productRequest.clone(), productResponse.clone()).catch(err => console.error(err));
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);

		// Cache related resources: MA01 & MA02
		productRequest = await _getProductMediaRequest('MA01');
		productResponse = await _getProductMediaResponse(productRequest);
		await cache.put(productRequest.clone(), productResponse.clone()).catch(err => console.error(err));
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);

		productRequest = await _getProductMediaRequest('MA02');
		productResponse = await _getProductMediaResponse(productRequest);
		await cache.put(productRequest.clone(), productResponse.clone()).catch(err => console.error(err));
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);
		// await CacheLib.addToCache(productRequest, productResponse, PRODUCT_CACHE);
	}

	async function _getProductMediaRequest(sku)
	{
		// Get product Media URL
		let product = await getProduct(sku, new Request(`/api/product/${sku}`))
		if (product == null) return null;
		let productMediaURL = product.media[0];
		return new Request(productMediaURL);
	}

	async function _getProductMediaResponse(request)
	{
		// Cache resource dynamically in the background
		let productResponse = await CacheLib.getFromCache(PRODUCT_CACHE, request.url);
		if (productResponse) return productResponse;
		productResponse = await CacheLib.networkOnlyStrategy(request, PRODUCT_CACHE, { credentials: 'omit' });
		if (CacheLib.checkValidResponse(productResponse)) return productResponse;

		return null;
	}

	async function _safeCacheManagementUpdate(requestURL, oldCacheBehaviour, newCacheBehaviour)
	{
		// Use mutex to prevent race conditions when checking out cache bookkeeping 
		// from IndexedDB between multiple incoming requests
		// TODO: Better mutex handling to prevent deadlocks on errors 
		const release = await mutex.acquire();
		try
		{
			await CacheLib.updateCacheManagementBasedOnBehaviour(requestURL, oldCacheBehaviour, newCacheBehaviour);
			return await release();
		}
		catch
		{
			return await release();
		}
	}

	async function _emptyProductCache()
	{
		let cache = await caches.open(PRODUCT_CACHE);
		let cacheKeys = await cache.keys();
		for (let key of cacheKeys)
		{
			await CacheLib.deleteFromCache(key.url, PRODUCT_CACHE);
		}
	}

	async function _safeHistoryProductCacheUpdate(productMediaRequest, productResponse)
	{
		const release = await productCacheMutex.acquire();
		try
		{
			let productCacheManagement = await localForage.getItem("productCacheManagement");
			if (productCacheManagement == null)
				productCacheManagement = {}

			let cache = await caches.open(PRODUCT_CACHE);
			let cacheKeys = await cache.keys();
			if (cacheKeys.length >= PRODUCT_CACHE_LIMIT)
			{
				// Find oldest entry and replace it with new resource
				// Regular cache cannot be used for 3rd party requests because of CORS
				let oldestDate = null;
				let oldestRequestURL = null;
				for (let i = 0; i < cacheKeys.length; ++i)
				{
					let url = cacheKeys[i];
					let date = productCacheManagement[url.url];
					if (oldestDate == null || date < oldestDate)
					{
						oldestDate = date;
						oldestRequestURL = url;
					}
				}
				delete productCacheManagement[oldestRequestURL.url];
				await cache.delete(oldestRequestURL).catch(err => console.error(err));
				console.info("Removed from cache: ", oldestRequestURL.url);
			}
			productCacheManagement[productMediaRequest.url] = new Date().getTime();
			await cache.put(productMediaRequest.clone(), productResponse.clone()).catch(err => console.error(err));
			await localForage.setItem("productCacheManagement", productCacheManagement);
			release();
		}
		catch
		{
			release();
		}
	}

	async function handleProductCachePolicy(event, response)
	{
		let productCachePolicy = await localForage.getItem("productCachePolicy");
		if (response != null)
		{
			if (productCachePolicy === "none" || productCachePolicy === null)
			{
				// Return regular response, no cache
				return await CacheLib.networkOnlyStrategy(event.request, RUNTIME, { credentials: 'omit', mode: 'cors' });
			}
			else if (productCachePolicy === "history")
			{
				let productResponse = await caches.match(event.request, { PRODUCT_CACHE });
				if (productResponse) return productResponse;
				productResponse = await CacheLib.networkOnlyStrategy(event.request, RUNTIME, { credentials: 'omit', mode: 'cors' });
				let cache = await caches.open(PRODUCT_CACHE);
				let cacheKeys = await cache.keys();
				if (cacheKeys.length >= PRODUCT_CACHE_LIMIT)
				{
					// Find oldest entry and replace it with new resource
					let oldestDate = null;
					let oldestRequestURL = null;
					for (let i = 0; i < cacheKeys.length; ++i)
					{
						// cacheKeys = await cache.keys();
						let url = cacheKeys[i];
						let resource = await cache.match(url);
						let date = CacheLib.getHeader(resource, 'date');
						if (date == null || date < oldestDate)
						{
							oldestDate = date;
							oldestRequestURL = url;
						}
					}
					await CacheLib.deleteFromCache(oldestRequestURL, PRODUCT_CACHE);
				}
				if (productResponse != null && productResponse.status !== 404)
				{
					await CacheLib.addToCache(event.request, productResponse.clone(), PRODUCT_CACHE);
					return productResponse;
				}
				let placeholder = await CacheLib.getFromCache(RUNTIME, "/img/product-placeholder.svg");
				if (placeholder) return placeholder;
				return new Response("", { status: 404 });
			}
			else if (productCachePolicy === "predictive")
			{

			}
		}
		else
		{
			if (productCachePolicy === "none" || productCachePolicy === null)
			{
				// Return regular response, no cache
			}
			else if (productCachePolicy === "history")
			{

			}
			else if (productCachePolicy === "predictive")
			{

			}
		}
	}

	async function dynamicHistoryHandler(requestURL)
	{
		let prefix = "https://pwa.local:8080/product/";
		// Get product sku
		let queryIndex = requestURL.indexOf("?");
		let sku;
		if (queryIndex !== -1)
			requestURL = requestURL.slice(0, queryIndex);

		sku = requestURL.slice(prefix.length);

		// Get product media
		let productMediaRequest = await _getProductMediaRequest(sku);
		// let product = await getProduct(sku, new Request(`/api/product/${sku}`))
		// if (product == null) return;
		// let productMediaURL = product.media[0];
		// let productMediaRequest = new Request(productMediaURL);

		// Cache resource dynamically in the background
		let productResponse = await _getProductMediaResponse(productMediaRequest);
		// let productResponse = await CacheLib.getFromCache(PRODUCT_CACHE, productMediaRequest.url);
		// if (productResponse) return;
		// productResponse = await CacheLib.networkOnlyStrategy(productMediaRequest, PRODUCT_CACHE, { credentials: 'omit' });
		// if (!CacheLib.checkValidResponse(productResponse)) return;

		await _safeHistoryProductCacheUpdate(productMediaRequest, productResponse)

		return;
	}

	async function getProduct(sku, request)
	{
		let productsURL = `${DOMAIN}api/products/`;

		let productsResponse = await CacheLib.getFromCache(RUNTIME, productsURL);
		if (!CacheLib.checkValidResponse(productsResponse))
		{
			let productResponse = await CacheLib.defaultFallbackStrategy(request);
			return await CacheLib.readJSONResponse(productResponse);
		}
		if (!CacheLib.checkValidResponse(productsResponse))
			return null;


		let products = await CacheLib.readJSONResponse(productsResponse);
		if (products == null) return null;

		for (let i = 0; i < products.length; ++i)
		{
			if (products[i]['sku'] === sku)
			{
				return products[i];
			}
		}
		return null;
	}

	async function matchRequest(event)
	{
		let url = event.request.url;
		let cacheManagementRef = await localForage.getItem("cacheManagementRef");
		let behaviourAndUrl = CacheLib.getBehaviourAndURLFromCacheManagement(url, cacheManagementRef, RUNTIME);
		return behaviourAndUrl;
	}

	async function customHandler(request, cacheName)
	{
		let requestURL = request.url;
		// Handle Magento API
		if (requestURL.startsWith(`${DOMAIN}api/product/`))
		{
			let startFromUrl = `${DOMAIN}api/product/`;
			let sku = requestURL.slice(startFromUrl.length)
			let product = await getProduct(sku, request);
			if (product == null) return new Response("404", { status: 404 });
			return CacheLib.createJSONResponse(product);
		}
		return new Response("404", { status: 404 });
	}

	async function getResponse(request, behaviour)
	{
		if (behaviour === 'cf')
		{
			return await CacheLib.cacheFirstStrategy(request, RUNTIME);
		}
		else if (behaviour === 'co')
		{
			return await CacheLib.cacheOnlyStrategy(request, RUNTIME);
		}
		else if (behaviour === 'nf')
		{
			// Hack: Solve refresh when offline
			if (request.url.startsWith(DOMAIN + 'category/'))
			{
				return await CacheLib.networkFirstStrategy(new Request(DOMAIN + 'category/Women-Tops'), RUNTIME);
			}
			else if (request.url.startsWith(DOMAIN + 'product/'))
				return await CacheLib.networkFirstStrategy(new Request(DOMAIN + 'product/MA01'), RUNTIME);
			return await CacheLib.networkFirstStrategy(request, RUNTIME);
		}
		else if (behaviour === 'no')
		{
			return await CacheLib.networkOnlyStrategy(request, RUNTIME);
		}
		else if (behaviour === 'swr')
		{
			return await CacheLib.staleWhileRevalidateStrategy(request, RUNTIME);
		}
		else if (behaviour === 'custom')
		{
			return await customHandler(request, RUNTIME);
		}
		else if (!request.url.startsWith(self.location.origin))
		{
			if (request.url.startsWith("https://vuestorefront-demo.phpro.be/pub/media/catalog/product"))
			{
				let productResponse = await CacheLib.getFromCache(PRODUCT_CACHE, request.url);
				if (productResponse) return productResponse;
				// productResponse = await CacheLib.networkOnlyStrategy(request, PRODUCT_CACHE, { credentials: 'omit', mode: 'cors' });
				productResponse = await CacheLib.networkOnlyStrategy(request, PRODUCT_CACHE, { credentials: 'omit' });
				// let productResponse = await CacheLib.cacheFirstStrategy(request, PRODUCT_CACHE, { credentials: 'omit', mode: 'cors' })
				if (CacheLib.checkValidResponse(productResponse)) return productResponse;

				let placeholderResponse = await CacheLib.cacheFirstStrategy(new Request("/img/product-placeholder.svg"), RUNTIME);
				if (CacheLib.checkValidResponse(placeholderResponse)) return placeholderResponse;
			}
			return await CacheLib.defaulThirdPartytFallbackStrategy(request);
		}
		else 
		{
			return await CacheLib.defaultFallbackStrategy(request);
		}
	}
} else
{
	console.error(`Boo! Workbox didn't load 😬`);
}
