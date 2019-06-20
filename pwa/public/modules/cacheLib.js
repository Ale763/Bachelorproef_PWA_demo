importScripts("https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js");
importScripts(`/modules/mutex.js`);

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

class CacheLib
{
	constructor() { }

	// ===================================================================================================
	// Main functions

	// ---------------------------------------------------------------------------------------------------------------------
	// Naive precache
	static precache(cacheName, url)
	{
		caches.open(cacheName)
			.then(cache => cache.add(url))
			.catch(error => console.error("ERROR Precaching: ", error));
	}

	static precachePage(cacheName, url)
	{
		const request = new Request(url);
		return fetch(request).then(response =>
		{
			CacheLib.addToCache(request, response, cacheName)
		})
	}

	static precacheAll(cacheName, urlList)
	{
		return caches.open(cacheName)
			.then(async (cache) =>
			{
				for (let i = 0; i < urlList.length; ++i)
				{
					let result = await CacheLib._fetchUrl(urlList[i]);
					cache.put(result.request.clone(), result.response.clone())
				}
				cache.addAll(urlList)
			})
			.catch(error => console.error("ERROR Precaching: ", error));
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Smart precache & activation
	static async smartPrecacheList(cacheName, newPrecacheList)
	{
		// let installMutex = new Mutex();
		return await caches.open(cacheName)
			.then(async (cache) =>
			{
				let oldPrecacheList = await localForage.getItem("precacheList");
				if (oldPrecacheList == null)
					oldPrecacheList = [];
				let cacheManagementRef = await localForage.getItem("cacheManagementRef").catch(error => { console.error(error); });
				if (cacheManagementRef == null)
				{
					cacheManagementRef = {
						cf: { options: {}, entries: [] },
						co: { options: {}, entries: [] },
						nf: { options: {}, entries: [] },
						no: { options: {}, entries: [] },
						swr: { options: {}, entries: [] },
						custom: { options: {}, entries: [] },
					}
				}
				// Analyze new precache list
				for (let i = 0; i < newPrecacheList.length; ++i)
				{
					let precacheItem = newPrecacheList[i];
					let url = precacheItem.url;

					// Search for url in old list (we assume not found equals new or modified file )
					let unchanged = false;
					for (let j = 0; j < oldPrecacheList.length; ++j)
					{
						if (oldPrecacheList[j].url === url)
						{
							unchanged = true;				// Mark found
							oldPrecacheList.splice(j, 1);	// Remove from old list
							break;
						}
					}
					let cacheBehaviour;
					if (precacheItem.urlIsDynamic && precacheItem.cacheBehaviour != null)
					{
						cacheBehaviour = precacheItem.cacheBehaviour;
						cacheManagementRef[cacheBehaviour].options[url] = precacheItem.urlPattern;
						let req = new Request(precacheItem.template);
						let resp = await CacheLib.networkOnlyStrategy(req, cacheName);
						CacheLib.addToCache(new Request("https://pwa.local:8080" + url), resp.clone(), cacheName)
						// {pattern: precacheItem.urlPattern, related: precacheItem.related};
					}
					else
						cacheBehaviour = await CacheLib.smartPrecacheItem(url, unchanged, cacheName);
					if (cacheBehaviour != null && cacheManagementRef[cacheBehaviour] != null)
					{
						cacheManagementRef[cacheBehaviour].entries.push(url);
					}
				}
				localForage.setItem("obsoleteList", oldPrecacheList);					// Store file with obsolete files
				localForage.setItem("precacheList", newPrecacheList);					// Store new precacheList
				await localForage.setItem("cacheManagementRef", cacheManagementRef);	// Store modified cache management
			})
			.catch(error => 
			{
				console.error("ERROR Precaching: ", error);
			});
	}

	// Caches resource and returns cachebehaviour
	static async smartPrecacheItem(url, resourceUnchanged, cacheName)
	{
		let oldResponse;
		let wasCached = false;
		let oldCacheBehaviour;

		if (resourceUnchanged)
		{
			oldResponse = await CacheLib.getFromCache(cacheName, url);
			wasCached = (oldResponse != null);
			if (wasCached)
				oldCacheBehaviour = await CacheLib._getCacheBehaviourFromResponse(oldResponse.clone());
		}
		const hadAggressiveCacheBehaviour = (oldCacheBehaviour === 'co' || oldCacheBehaviour === 'cf');

		let cacheBehaviour;
		if (!wasCached || hadAggressiveCacheBehaviour)
		{
			let result = await CacheLib._fetchUrl(url);
			if (result.response.status >= 200 && result.response.status < 400)
			{
				cacheBehaviour = await CacheLib._getCacheBehaviourFromResponse(result.response.clone());
				CacheLib.addToCache(result.request.clone(), result.response.clone(), cacheName)
			}
			else
			{
				console.error("Error with response retrieval")
			}
		}
		return cacheBehaviour;
	}

	static async smartMigrate(cacheManagementRef, obsoleteList, cacheName)
	{
		for (let i = 0; i < obsoleteList.length; ++i)
		{
			let url = obsoleteList[i].url;
			CacheLib.deleteFromCache(new Request(url), cacheName);
			let behaviour = CacheLib.findBehaviourForUrlInCacheManagement(url, cacheManagementRef);
			cacheManagementRef[behaviour].entries = CacheLib._deleteByValueFromArray(cacheManagementRef[behaviour].entries, url);
		}

		return cacheManagementRef;
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// 
	static async getBehaviourAndURLFromCacheManagement(url, cacheManagementRef, cacheName)
	{
		if (url == null)
			return { cacheBehaviour: null, url: url };

		// * Needed because of simpler dynamic url matching (see below in function)
		let queryIndex = url.indexOf("?");
		if (queryIndex !== -1)
			url = url.slice(0, queryIndex);

		let origin = "https://pwa.local:8080/";
		let behaviours = Object.keys(cacheManagementRef);
		for (let behaviour of behaviours)
		{

			let entries = cacheManagementRef[behaviour].entries;
			for (let i = 0; i < entries.length; ++i)
			{
				let entry = entries[i]
				if (url.endsWith(entry))
					return { cacheBehaviour: behaviour, url: url };

				// Shortcut to handle only same site resources this way for this POC
				// should be handled better in production
				if (!url.startsWith(origin))
					break;

				// Search for behaviour, if url is dynamic
				let shortURL = url.slice(origin.length)
				let options = Object.keys(cacheManagementRef[behaviour].options);
				for (let option of options)
				{
					// let optionPattern = cacheManagementRef[behaviour].options[option];
					if (option[0] === '/')
						option = option.slice(1);

					// Dynamic url matching
					// * This code is more naive and needs query params to be cut off (see top of this function)
					if (shortURL.startsWith(option))
						return { cacheBehaviour: behaviour, url: url };

					// * This code is more robust (supports multiple url params, but takes longer)
					// let pattern = new RegExp("^" + optionPattern);
					// if (pattern.test(shortURL))
					// {
					// 	return { cacheBehaviour: behaviour, url: url };
					// }
				}
			}
		}
		return { cacheBehaviour: null, url: url };
	}

	static async updateCacheManagementBasedOnBehaviour(url, oldCacheBehaviour, newCacheBehaviour)
	{
		let hadBehaviour = oldCacheBehaviour != null;
		let hasBehaviour = newCacheBehaviour != null;
		let behaviourChanged = ((hadBehaviour || hasBehaviour) && (oldCacheBehaviour !== newCacheBehaviour));

		// If behaviour did not change, there is nothing to do
		if (!behaviourChanged)
			return;

		let cacheManagementRef = await localForage.getItem("cacheManagementRef")
			.catch(error =>
			{
				console.error(error);
				throw (error);
			});

		// Set new cache behaviour, if there is one
		if (hasBehaviour)
			cacheManagementRef[newCacheBehaviour].entries.push(url);

		// Delete old cache behaviour, if there was one
		if (hadBehaviour)
		{
			await CacheLib._deleteByValueFromArray(cacheManagementRef[oldCacheBehaviour].entries.length, url);
		}
		// return cacheManagementRef;
		await localForage.setItem("cacheManagementRef", cacheManagementRef)
			.catch(error =>
			{
				console.error(error);
				throw (error);
			});
	}

	static async updateCacheBasedOnBehaviour(request, response, cacheBehaviour, cacheName)
	{
		// Cache response depending on strategy, delete if necessary
		if (cacheBehaviour === 'cf' || cacheBehaviour === 'co' || cacheBehaviour === 'nf' || cacheBehaviour === 'swr')
		{
			await CacheLib.addToCache(request, response, cacheName);
		}
		else if (cacheBehaviour === 'no')
		{
			await CacheLib.deleteFromCache(request.clone());
		}
	}

	// ---------------------------------------------------------------------------------------------------------------------
	// Cache management
	static async getFromCache(cacheName, url)
	{
		return await caches.match(url, { cacheName });
	}

	static matchCache(request)
	{
		return caches.match(request)
			.then(response =>
			{
				console.log(response);
				return response;
			})
			.catch(error => console.error(error));
	}

	static searchCache(id)
	{
		return caches
			.open('img-resources')
			.then(cache =>
			{
				// console.log("Searching keys for id", id);
				// console.log("KEYS", keys);
				return cache.keys()
					.then(urls =>
					{
						for (let i = 0; i < urls.length; ++i)
						{
							if (urls[i].url ===
								`https://jsonplaceholder.typicode.com/posts/${id}`)
								return true;
						}
						return false;
					})
					.catch(error => console.error("SW searchCache", error));
			}
			)
			.catch(error => { console.error("Error cached", error) })
	}

	static async deleteFromCache(request, cacheName)
	{
		return await caches.open(cacheName)
			.then((cache) =>
			{
				cache.delete(request);
			})
			.catch((error) => { console.error("DeleteFromCache Error: ", error) })
	}

	static async addToCache(request, response, cacheName)
	{
		// console.log("Add to cache: ", request.method);
		if (request.method !== "GET")
			return;
		if (response.status < 200 || response.status >= 400)
		{
			console.error("Error response: ", response);
		}
		return await caches.open(cacheName)
			.then((cache) =>
			{
				return cache.put(request.clone(), response.clone());
				// console.log("Adding to cache...", request.url);
			})
			.catch((error) => { console.error("addToCache Error: ", error) })
	}

	// ===================================================================================================
	// Fetch strategies

	static async cacheOnlyStrategy(request, cacheName)
	{
		let cachedResponse = await CacheLib.getFromCache(cacheName, request.url);
		if (cachedResponse) return cachedResponse;
		return new Response("404", { status: 404 });
	}

	static async networkOnlyStrategy(request, cacheName, fetchOptions = { credentials: 'include' })
	{
		let response = await fetch(request, fetchOptions).catch(err => { return null; });
		CacheLib.deleteFromCache(request.clone(), cacheName);
		if (response) return response;
		return new Response("404", { status: 404 });
	}

	static async networkFirstStrategy(request, cacheName, fetchOptions = { credentials: 'include' })
	{
		let response = await fetch(request, fetchOptions).catch(err => { return null; });
		if (response)
		{
			CacheLib.addToCache(request.clone(), response.clone(), cacheName);
			return response;
		}
		let cachedResponse = await CacheLib.getFromCache(cacheName, request.url);
		if (cachedResponse) return cachedResponse;
		return new Response("404", { status: 404 });
	}

	static async cacheFirstStrategy(request, cacheName, fetchOptions = { credentials: 'include' })
	{
		let cachedResponse = await CacheLib.getFromCache(cacheName, request.url);
		if (cachedResponse) return cachedResponse;
		let response = await fetch(request, fetchOptions).catch(err => { return null; });
		if (response)
			CacheLib.addToCache(request.clone(), response.clone(), cacheName);

		return response;
	}

	static async staleWhileRevalidateStrategy(request, cacheName, fetchOptions = { credentials: 'include' })
	{
		let cachedResponse = await CacheLib.getFromCache(cacheName, request.url);
		let response = CacheLib._swrFetch(request, cacheName, fetchOptions);
		if (cachedResponse) return cachedResponse;
		response = await response;
		if (response) return response;
		return new Response("404", { status: 404 });
	}

	static async _swrFetch(request, cacheName, fetchOptions = { credentials: 'include' })
	{
		return await fetch(request, fetchOptions)
			.then(response =>
			{
				CacheLib.addToCache(request.clone(), response.clone(), cacheName);

			}).catch(err => { return null; });
	}

	static async defaultFallbackStrategy(request, fetchOptions = { credentials: 'include' })
	{
		let response = await fetch(request, fetchOptions).catch(err => { /* console.error(err); */ return null; });
		if (response) return response;
		return new Response("404", { status: 404 });
	}

	static async defaulThirdPartytFallbackStrategy(request, fetchOptions = { credentials: 'omit', mode: 'cors' })
	{
		let response = await fetch(request, fetchOptions).catch(err => { /* console.error(err); */ return null; });
		if (response) return response;
		return new Response("404", { status: 404 });
	}

	// ===================================================================================================
	// Response handler functions

	static createJSONResponse(jsonData)
	{
		return new Response(JSON.stringify(jsonData), { headers: { "Content-Type": "application/json" } });
	}

	static async readJSONResponse(response)
	{
		if (response)
			return await response.json().catch(err => { return null; });
		return response
	}

	static checkValidResponse(response)
	{
		if (response == null || (response.status < 200 || response.status >= 400))
			return false;
		return true;
	}

	// ===================================================================================================
	// Helper functions
	static async _fetchRequest(request)
	{
		const requestClone = request;
		return fetch(request)
			.then((response) =>
			{
				return {
					request: requestClone,
					response: response.clone()
				};
			})
			.catch(error =>
			{
				console.error(error);
				console.error(JSON.stringify(error));
			});
	}

	static _fetchUrl(url)
	{
		let request = new Request(url);
		const requestOptions = { method: 'GET' };
		return fetch(request, requestOptions)
			.then((response) =>
			{
				return {
					request: request,
					response: response.clone()
				};
			})
			.catch(error =>
			{
				console.error(error);
				console.error(JSON.stringify(error));
			});
	}

	static _printRequestHeaders(request)
	{
		console.log("REQUEST HEADERS: ", request);
		for (var header of request.headers)
		{
			console.log(header);
		}
	}

	static _printResponseHeaders(response)
	{
		console.log("RESPONSE HEADERS: ", response.clone());
		for (var header of response.headers)
		{
			console.log(header);
		}
	}

	static async _getCacheBehaviourFromResponse(response)
	{
		return CacheLib.getHeader(response, 'x-cb');
	}

	static getHeader(req_res, headerKey)
	{
		for (var header of req_res.headers)
		{
			if (header[0] === headerKey)
			{
				return header[1];
			}
		}
		return null;
	}

	static _deleteByValueFromArray(arr, value)
	{
		for (let i = 0; i < arr.length; ++i)
		{
			if (arr[i] === value)
			{
				arr.splice(i, 1);
				i--;
			}
		}
		return arr;
	}
}

