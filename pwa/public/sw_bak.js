importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js")
importScripts(`/modules/cacheLib.js`);
const SW_VERSION = 0;
const aggresiveUpdate = true;
const withClaim = true;
let cookie = "Type=0";

// =====================================================================================================================
// Global configs en initialization
const PREFIX = "PWA";
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

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
	                 localForage = localforage.createInstance({name: "lf"});
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
	// Perform install steps
	if (SW_VERSION === 0)
		console.log("GLOBAL Install SW A");
	else
		console.log("GLOBAL Install SW B");

	const urls = [
		"/img/dog.png",
		"/img/cat.png",
		"/img/horse.png",
		// "/img/qhd.jpg",
		"/css/chunk-vendors.c54c336c.css",
		"/images/icons/icon-72x72.png",
		"/images/icons/icon-96x96.png",
		"/images/icons/icon-128x128.png",
		"/images/icons/icon-144x144.png",
		"/images/icons/icon-152x152.png",
		"/images/icons/icon-192x192.png",
		"/images/icons/icon-384x384.png",
		"/images/icons/icon-512x512.png",
		"/img/icons/android-chrome-192x192.png",
		"/img/icons/android-chrome-512x512.png",
		"/img/icons/apple-touch-icon.png",
		"/img/icons/apple-touch-icon-60x60.png",
		"/img/icons/apple-touch-icon-76x76.png",
		"/img/icons/apple-touch-icon-120x120.png",
		"/img/icons/apple-touch-icon-152x152.png",
		"/img/icons/apple-touch-icon-180x180.png",
		"/img/icons/favicon-16x16.png",
		"/img/icons/favicon-32x32.png",
		"/img/icons/msapplication-icon-144x144.png",
		"/img/icons/mstile-150x150.png",
		"/img/icons/safari-pinned-tab.svg",
		"/img/GoogleFont.css",
		"/img/logo.82b9c7a5.png",
		"/img/logo.63a7d78d.svg",
		"/img/product-placeholder.svg",
		"/js/chunk-vendors.92af87c1.js",
		"/js/products.96858132.js",
		"/js/update.1f5eba79.js",
		"/js/app.c3e8e907.js",
		"/js/about.4b58b1b3.js",
		"/modules/firebaseLib.js",
		"/modules/firebaseInit.js",
		"/modules/cacheLib.js",
		"/modules/firebaseHelper.js",
		"/favicon.ico",
		"/index.html",
		"/manifest.json",
		// "/update.js",
		"/robots.txt",
		"https://vuestorefront-demo.phpro.be/rest/V1/products/24-MB01",
		"https://vuestorefront-demo.phpro.be/rest/V1/products/WS12",
		"https://vuestorefront-demo.phpro.be/pub/media/catalog/product/w/s/ws12-orange_main_2.jpg",
		"https://vuestorefront-demo.phpro.be/pub/media/catalog/product/m/b/mb01-blue-0.jpg",
	];
	// const cacheName = workbox.core.cacheNames.runtime;
	event.waitUntil(CacheLib.precacheAll(RUNTIME, urls));
	event.waitUntil(CacheLib.precachePage(RUNTIME, "/"));
	event.waitUntil(CacheLib.precachePage(RUNTIME, "/about"));
	event.waitUntil(CacheLib.precachePage(RUNTIME, "/products"));
	if (aggresiveUpdate)
		self.skipWaiting();
});

// ---------------------------------------------------------------------------------------------------------------------
// Activation
self.addEventListener('activate', (event) =>
{
	console.log("ACTIVATION!!!!!!!!");
	// Clean up old cache versions
	if (SW_VERSION === 0)
		console.log("GLOBAL Activate SW A");
	else
		console.log("GLOBAL Activate SW B");
	if (withClaim)
		self.clients.claim();
});

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
				                                              // return CacheLib._fetchUrl("https://pwa.local:8080")
				                                              //                .then(newResponse =>
				                                              //                      {
				                                              //                          CacheLib.addToCache(newResponse.request.clone(),
				                                              // newResponse.response.clone(), RUNTIME); return
				                                              // newResponse.response } );

				                                              return fetch(request)
				                                              .then(newResponse =>
				                                                    {

					                                                    CacheLib.addToCache(request.clone(), newResponse.clone(), RUNTIME);
					                                                    return newResponse
				                                                    })
			                                              }
		                                              })
		                                        .catch(error => console.error(error));
		                   // if (cachedResponse)
		                   //     return cachedResponse;
		                   // else
		                   // {
		                   //     return CacheLib._fetchUrl("https://pwa.local:8080")
		                   //                    .then(response =>
		                   //                          {
		                   //                              CacheLib.addToCache(response.request,
		                   // response.response.clone(), RUNTIME); return response.response } ); }
	                   });
}

async function updateResponse()
{
	// self.skipWaiting();
	return new Response("", {headers: {"Refresh": "0"}});
}

async function updateTest()
{
	let waiting = self.registration.waiting;
	let clientsAmt = (await self.clients.matchAll()).length;
	return {waiting: waiting, clientsAmt: clientsAmt};
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

// ---------------------------------------------------------------------------------------------------------------------
// Fetch
self.addEventListener('fetch', async (event) =>
{
	const requestURL = event.request.url;
	// console.log("GLOBAL FETCH: ", SW_VERSION);
	// console.log("Global Fetch: ", event.request.url);


	// event.waitUntil(checkForUpdate(event.request));

	// if (event.request.url.match(/https:\/\/.*\/update.js/))
	// {
	// 	event.respondWith(updateH(event))
	// }
	// else if (event.request.url.startsWith("https://vuestorefront-demo.phpro.be/pub/media/catalog/product/"))
	// {
	// 	event.respondWith(imgProduct(event));
	//
	// }

	/*
	 if (event.request.url.match(/https:\/\/.*\/1/))
	 {


	 event.respondWith(similarityTest(event.request));
	 return;

	 }
	 else if (event.request.url.match(/https:\/\/.*\/api/))
	 {
	 console.log("Ok");

	 }
	 else if (event.request.method === "GET")
	 {
	 if (requestURL.match(/https:\/\/pwa\.local:8080(\/|\/about|\/products|\/index.html)$/))
	 {
	 event.respondWith(respondToIndex(event.request));
	 } else if (requestURL.startsWith(`${DOMAIN}/css/`) || requestURL.startsWith(`${DOMAIN}/images/icons/`)
	 || requestURL.startsWith(`${DOMAIN}/img/`) || requestURL.startsWith(`${DOMAIN}/js/`) || requestURL.startsWith(`${DOMAIN}/modules/`)
	 || requestURL.startsWith(`${DOMAIN}/favicon.ico`) || requestURL.startsWith(`${DOMAIN}/update.js`)
	 || requestURL.startsWith(`${DOMAIN}/manifest.json`) || requestURL.startsWith(`${DOMAIN}/robots.txt`)
	 || requestURL.startsWith(`https://vuestorefront-demo.phpro.be/rest/V1/`))
	 {
	 event.respondWith(respondToIndex(event.request));
	 } else
	 {
	 event.respondWith(respondToApi(event.request));
	 }
	 }*/
});

async function updateH(event)
{
	console.log("HANDLING UPDATE.JS");
	let newRequest = new Request(event.request);
	newRequest.headers.set("Cache-Control", "max-age=0");
	let cachedResponse = await CacheLib.getFromCache(RUNTIME, newRequest.url);
	if (cachedResponse)
	{

		for (let h of cachedResponse.headers)
		{console.log(h);}
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
		{console.log(h);}
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
		{console.log(h);}
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
			self.registration.waiting.postMessage({action: 'skipWaiting'});
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
	if (url.href !== 'https://pwa.local:8080/update.js')
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
	return await caches.match(url, {RUNTIME});
}

async function matchCacheFirstFuntion(url, event)
{
	if (url.href !== 'https://pwa.local:8080/update.js')
		return false;
	let request = event.request.clone();
	let response = await CacheLib.getFromCache(RUNTIME, request);
	let response2 = await cccccc(request.url);
	if (response == null)
		return true;
	return checkMaxAge(response);
}

if (workbox)
{
	console.log(`Yay! Workbox is loaded 🎉`);

	const matchNetworkFirst = ({url, event}) => { return matchNetworkFirstFuntion(url, event); };
	const matchCacheFirst = ({url, event}) => { return matchCacheFirstFuntion(url, event); };

	const myPlugin = {
		cacheWillUpdate: async ({request, response, event}) =>
		{
			// Return `response`, a different Response object or null
			console.log("cacheWillUpdate");
			return response;
		},
		cacheDidUpdate: async ({cacheName, request, oldResponse, newResponse, event}) =>
		{
			// No return expected
			// Note: `newResponse.bodyUsed` is `true` when this is called,
			// meaning the body has already been read. If you need access to
			// the body of the fresh response, use a technique like:
			// const freshResponse = await caches.match(request, {cacheName});
			console.log("cacheDidUpdate");
		},
		cacheKeyWillBeUsed: async function ({request, mode})
		{
			// request is the Request object that would otherwise be used as the cache key.
			// mode is either 'read' or 'write'.
			// Return either a string, or a Request whose url property will be used as the cache key.
			// Returning the original request will make this a no-op.
			console.log("cacheKeyWillBeUsed");
		},
		cachedResponseWillBeUsed: async ({cacheName, request, matchOptions, cachedResponse, event}) =>
		{
			// Return `cachedResponse`, a different Response object or null
			console.log("cachedResponseWillBeUsed");
			return cachedResponse;
		},
		requestWillFetch: async ({request}) =>
		{
			// Return `request` or a different Request
			console.log("requestWillFetch");
			// try
			// {
			// 	const freshResponse = await caches.match(request.clone(), {RUNTIME});
			// 	console.log(JSON.stringify(freshResponse));
			// }
			// catch (e)
			// {
			// 	console.log(e)
			// }
			return request;
		},
		fetchDidFail: async ({originalRequest, request, error, event}) =>
		{
			// No return expected.
			// NOTE: `originalRequest` is the browser's request, `request` is the
			// request after being passed through plugins with
			// `requestWillFetch` callbacks, and `error` is the exception that caused
			// the underlying `fetch()` to fail.
			console.log("fetchDidFail");
		},
		fetchDidSucceed: async ({request, response}) =>
		{
			// Return `response` to use the network response it as-is,
			// or alternatively create and return a new Response object.
			console.log("fetchDidSucceed");
			return response;
		}
	};


	workbox.routing.registerRoute(
	matchNetworkFirst,
	new workbox.strategies.NetworkFirst(
	{
		cacheName: RUNTIME,
		// plugins: [myPlugin]
	})
	);

	workbox.routing.registerRoute(
	matchCacheFirst,
	new workbox.strategies.CacheFirst(
	{
		cacheName: RUNTIME,
	})
	);

} else
{
	console.log(`Boo! Workbox didn't load 😬`);
}

