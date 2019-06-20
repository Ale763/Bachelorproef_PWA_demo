importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');
importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js")
const DOMAIN = 'https://pwa.local:8080';
importScripts(`/modules/cacheLib.js`);
const SW_VERSION = 1;
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
		                                    name: 'Alessio',
		                                    version: 1.0,
		                                    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
		                                    storeName: 'lf', // Should be alphanumeric, with underscores.
		                                    description: 'some description'
	                                    });
	                 localForage = localforage.createInstance({name: "lf"});
                 });

// =====================================================================================================================
// Event handling


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


self.addEventListener('install', (event) =>
{
	// Perform install steps
	if (SW_VERSION === 0)
		console.log("GLOBAL Install SW A");
	else
		console.log("GLOBAL Install SW B");

	const urls = [
		// "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons",
		// "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
		"/img/dog.png",
		"/img/cat.png",
		"/img/horse.png",
		"/index.html",
		"/img/*",
		"/images/*",
	];
	// const cacheName = workbox.core.cacheNames.runtime;
	event.waitUntil(CacheLib.precacheAll(PRECACHE, urls));
	event.waitUntil(caches.open(RUNTIME)
	                      .then((cache) => { }));
	if (aggresiveUpdate)
		self.skipWaiting();
});

self.addEventListener('activate', (event) =>
{
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

async function responseHandler(request, cachedResponse, parsedHeaders)
{
	if (parsedHeaders["cache-control"].cacheability === "no-store")
	{
		return fetch(request)
		.then(response =>
		      { return response; });
	} else if (parsedHeaders["cache-control"].cacheability === "no-cache")
	{
		let newRequestHeaders = new Headers();
		for (header of request.headers)
		{
			newRequestHeaders.append(header[0], header[1]);
		}

		if (parsedHeaders["etag"] != null)
			newRequestHeaders.append("if-none-match", parsedHeaders["etag"]);
		if (parsedHeaders["last-modified"] != null)
			newRequestHeaders.append("if-modified-since", parsedHeaders["last-modified"]);
		let cookie = await localforage.getItem("cookie");
		if (cookie != null)
			newRequestHeaders.append("cookie", cookie);
		for (let header of newRequestHeaders)
		{
			console.log(header);
		}
		const newRequest = new Request(request, {
			mode: 'cors',
			credentials: 'omit',
			headers: newRequestHeaders
		});
		return fetch(newRequest)
		.then(response =>
		      {
			      CacheLib.addToCache(request, response.clone(), RUNTIME);
			      return response;
		      });
	} else if (parsedHeaders["cache-control"].expiration.startsWith("max-age="))
	{
		let maxAge = parseInt(parsedHeaders["cache-control"].expiration.slice(8));
		let newDate = new Date(parsedHeaders["date"].getTime());
		newDate.setSeconds(newDate.getSeconds() + maxAge);
		let now = new Date();
		let newRequestHeaders = new Headers();
		let cookie = await localforage.getItem("cookie");
		let previousCookie = await localforage.getItem("previousCookie");
		newRequestHeaders.append("X-Cookie", cookie);
		// if (cookie != null)
		// {
		// 	newRequestHeaders.append("Cookie", cookie);
		// }
		if (newDate > now && previousCookie === cookie)
		{
			return cachedResponse;
		} else
		{

			for (header of request.headers)
			{
				newRequestHeaders.append(header[0], header[1]);
			}

			if (previousCookie === cookie)
			{

				if (parsedHeaders["etag"] != null)
					newRequestHeaders.append("If-None-Match", parsedHeaders["etag"]);
				if (parsedHeaders["last-modified"] != null)
					newRequestHeaders.append("If-Modified-Since", parsedHeaders["last-modified"]);
			} else
			{
				localforage.setItem("previousCookie", cookie);
			}
			for (let header of newRequestHeaders)
			{
				console.log(header);
			}
			const newRequest = new Request(request, {
				mode: 'cors',
				credentials: 'omit',
				headers: newRequestHeaders
			});
			return fetch(newRequest)
			.then(response =>
			      {
				      CacheLib.deleteFromCache(request, RUNTIME);
				      CacheLib.addToCache(request, response.clone(), RUNTIME);
				      return response;
			      });
		}
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

function respondToIndex(request)
{
	if (navigator.onLine)
	{

		return fetch(request)
		.then(response =>
		      {
			      console.log("Network response: ", response);
			      // CacheLib.deleteFromCache(request, RUNTIME);
			      CacheLib.addToCache(request, response.clone(), RUNTIME);
			      return response;
		      })
	} else
	{
		return caches.match(request)
		             .then(response =>
		                   {
			                   console.log(response);
			                   return response;
		                   })
		             .catch(error => console.error(error));
	}
}


self.addEventListener('fetch', (event) =>
{
	console.log("Global Fetch: ", event.request.url);
	if (event.request.method === "GET")
	{
		for (let header of event.request.headers)
		{
			if (header[0] === "X-INDEX" && header[0] === true)
			{
				event.respondWith(respondToIndex(event.request));
			}
		}
		if (event.request.url.match(/https:\/\/pwa.local:8080(\/|\/about|\/index.html)$/))
		{
			event.respondWith(respondToIndex(event.request));
		} else
		{
			event.respondWith(respondToApi(event.request));

		}
	}

	// if (event.request.url.match(/https:\/\/.*\/api/))
	// {
	//
	//
	// }

	// CacheLib._printRequestHeaders(event.request);
	// event.respondWith(_FetchUpdateJSHandler(event.request))
	// _FetchUpdateJSHandler(event.request);
	// }
	//
	// if (event.request.url.match(/https:\/\/pwa.local:8080\/85/))
	// {
	// 	// event.respondWith(fetch3rd(event.request))
	// 	_FetchUpdateJSHandler(event.request);
	// }
	// Update
	// if (event.request.url.match(/https:\/\/localhost:8080\/img\/horse\.jpg/))
	// {
	// 	event.respondWith(t())
	// }
	// Post & Products choice cache
	// const jsonPostsUrl = '/https:\\/\\/jsonplaceholder\\.typicode\\.com\\/posts\\/.*/'
	// if (event.request.url.match(/https:\/\/vuestorefront-demo\.phpro\.be\/rest\/V1\/products.*/) ||
	// event.request.url.match(/https:\/\/vuestorefront-demo\.phpro\.be\/pub\/catalog\/media.*/))
	// {
	// 	event.respondWith(
	// 	caches.match(event.request)
	// 	      .then(function (response)
	// 	            {
	//
	// 		            return response || fetch(event.request)
	// 		            .then(response => {return response})
	// 		            .catch(error =>
	// 		                   {
	// 			                   if (!navigator.onLine)
	// 			                   {
	// 				                   const response = new Response("Offline");
	// 				                   response.connectivity = false;
	// 				                   response.status = 500;
	// 				                   return response;
	// 			                   }
	// 		                   });
	// 	            })
	// 	      .catch(error =>
	// 	             {
	// 		             console.log("SW fetch", error);
	// 		             throw Error("Offline")
	// 	             })
	// 	);
	// }


});


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
		self.skipWaiting()
	}

	if (event.data && event.data.cookie)
	{
		setCookie(event.data.cookie);
	}

	// if (event.data.data && event.data.data.dev_comm)
	// {
	// 	console.log("SW Received Message: " + event.data.data);
	// 	if (workbox)
	// 	{
	// 		console.log("SW Received Message + Workbox : " + event.data.data.id);
	// 		const url = "https://jsonplaceholder.typicode.com/posts/" + event.data.data.id;
	// 		const cacheName = 'img-resources';
	// 		const request = new Request(url);
	// 		if (!navigator.onLine)
	// 		{
	// 			caches.open(cacheName)
	// 			      .then((cache) =>
	// 			            {
	// 				            CacheLib.searchCache(event.data.data.id)
	// 				                    .then(
	// 				                    alreadyCached =>
	// 				                    {
	// 					                    if (alreadyCached)
	// 						                    cache.delete(request);
	// 					                    event.stopPropagation();
	// 				                    }
	// 				                    )
	// 			            })
	// 			      .catch((error) => {debugger})
	// 		} else
	// 		{
	// 			event.waitUntil(
	// 			// Assume `cache` is an open instance of the Cache class.
	// 			fetch(request)
	// 			.then(response =>
	// 			      {
	// 				      caches.open(cacheName)
	// 				            .then((cache) =>
	// 				                  {
	// 					                  CacheLib.searchCache(event.data.data.id)
	// 					                          .then(
	// 					                          alreadyCached =>
	// 					                          {
	// 						                          if (alreadyCached)
	// 							                          cache.delete(request);
	// 						                          else
	// 							                          cache.put(request, response.clone())
	// 						                          event.stopPropagation();
	// 					                          }
	// 					                          )
	// 				                  })
	// 				            .catch((error) => {debugger})
	// 			      }
	// 			)
	// 			.catch(error => console.error("SW msg", error))
	// 			// caches.open(cacheName)
	// 			//       .then((cache) => cache.add(url))
	// 			//       .catch((error) => {debugger})
	// 			);
	//
	// 		}
	// 		// event.waitUntil(
	// 		// searchCache(event.data.data.id)
	// 		// .then(alreadyCached =>
	// 		//       {
	// 		// 	      if (alreadyCached)
	// 		// 	      {
	// 		// 		      // deleteFromCache(request, cacheName)
	// 		// 		      caches.open(cacheName)
	// 		// 		            .then((cache) =>
	// 		// 		                  {
	// 		// 			                  cache.delete(request);
	// 		// 		                  })
	// 		// 		            .catch((error) => {console.error("DeleteFromCache Error: ", error)})
	// 		// 	      }
	// 		// 	      else
	// 		// 	      {
	// 		// 		      fetch(request)
	// 		// 		      .then(response =>
	// 		// 		            {
	// 		// 			            // addToCache(request, response.clone(), cacheName)
	// 		// 			            caches.open(cacheName)
	// 		// 			                  .then((cache) =>
	// 		// 			                        {
	// 		// 				                        cache.put(request, response.clone())
	// 		// 			                        })
	// 		// 			                  .catch((error) => {console.error("addToCache Error: ", error)})
	// 		// 		            })
	// 		// 		      // cache.put(request, response.clone())
	// 		// 	      }
	// 		//       }
	// 		//       // Assume `cache` is an open instance of the Cache class.
	// 		//       // fetch(request)
	// 		//       // .then(response =>
	// 		//       //       {
	// 		//       // 	      caches.open(cacheName)
	// 		//       // 	            .then((cache) =>
	// 		//       // 	                  {
	// 		//       // 		                  searchCache(event.data.data.id)
	// 		//       // 		                  .then(
	// 		//       // 		                  alreadyCached =>
	// 		//       // 		                  {
	// 		//       // 			                  if (alreadyCached)
	// 		//       // 				                  cache.delete(request);
	// 		//       // 			                  else
	// 		//       // 				                  cache.put(request, response.clone())
	// 		//       // 			                  event.stopPropagation();
	// 		//       // 		                  }
	// 		//       // 		                  )
	// 		//       // 	                  })
	// 		//       // 	            .catch((error) => {debugger})
	// 		//       //       }
	// 		//       // )
	// 		//       // .catch(error => console.error(error))
	// 		//       // caches.open(cacheName)
	// 		//       //       .then((cache) => cache.add(url))
	// 		//       //       .catch((error) => {debugger})
	// 		// ));
	// 	} else
	// 	{
	// 		console.log("Workbox not available");
	// 	}
	// }
})
;


// =====================================================================================================================
// Workbox

if (workbox)
{
	console.log(`Yay! Workbox is loaded 🎉`);

// ================================================================================================================= //
//Workbox config
	workbox.setConfig({debug: false});

// ----------------------------------------------------------------------------------------------------------------- //
// Workbox cache config
	workbox.core.setCacheNameDetails({prefix: PREFIX, precache: PRECACHE, runtime: RUNTIME,});
// =================================================================================================================
// Precaching
	workbox.precaching.precacheAndRoute([]);


// ================================================================================================================= //
// Dynamic caching  workbox.routing.registerRoute( new RegExp('https://randomuser.me/api/.*'), new
// workbox.strategies.CacheFirst ({ cacheName: 'img-resources', plugins: [ new workbox.cacheableResponse.Plugin ({
// statuses: [0, 200] }) ] }) );  workbox.routing.registerRoute( // new
// RegExp('https://jsonplaceholder.typicode.com/posts/.*'), new
// RegExp('https://google.com/lkqsjdfmsqjdfmlqsjkfdmqljfmql'), new workbox.strategies.NetworkFirst ({ cacheName:
// 'api-cache', plugins: [ new workbox.cacheableResponse.Plugin ({ statuses: [0, 200] }) ] }) );  //
// ================================================================================================================= //
// Third party  //
// ----------------------------------------------------------------------------------------------------------------- //
// Google font stylesheets with stale-while-revalidate
	workbox.routing.registerRoute(
	/^https:\/\/fonts\.googleapis\.com/,
	new workbox.strategies.StaleWhileRevalidate(
	{
		cacheName:
		'google-fonts-stylesheets',
	}));
// Google font files cache for 1 full year workbox.routing.registerRoute(
	/^https:\/\/fonts\.gstatic\.com/,
	new workbox.strategies.CacheFirst(
	{
		cacheName: 'google-fonts-webfonts', plugins:
		[
			new workbox.cacheableResponse.Plugin({statuses: [0, 200],}),
			new workbox.expiration.Plugin({
				                              maxAgeSeconds: 60
				                              * 60 * 24 * 365,
				                              maxEntries: 30,
			                              }),],
	})

	;
// ================================================================================================================= //
// Media
	workbox.routing.registerRoute(/\.(?:ico|jpg|svg|gif|jpeg|png|webp)$/,
	                              new workbox.strategies.CacheFirst({
		                                                                cacheName: 'img-resources'
	                                                                }));
} else
{ console.log(`Boo! Workbox didn't load 😬`); }
