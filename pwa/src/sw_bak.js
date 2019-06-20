importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');



self.addEventListener('install', (event) =>
{
	// Perform install steps
	console.log("Install");
})

self.addEventListener('fetch', (event) =>
{
	// Handle requests
	console.log("fetch");
})

self.addEventListener('activate', (event) =>
{
	// Clean up old cache versions
	console.log("activate");
})

if (workbox)
{
	console.log(`Yay! Workbox is loaded 🎉`);

	// Force development builds
	// workbox.setConfig({ debug: true });


	// cache name
	workbox.core.setCacheNameDetails({
		                                 prefix: 'My-awesome-cache',
		                                 precache: 'precache',
		                                 runtime: 'runtime',
	                                 });

	workbox.precaching.precacheAndRoute([])

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

	workbox.routing.registerRoute(
	/^https:\/\/fonts\.googleapis\.com\/css\?family=Roboto:100,300,400,500,700,900\|Material\+Icons/,
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
//
//
//     workbox.routing.registerRoute(/(\.(?:js|css))|manifest.json$/,
//         new workbox.strategies.CacheFirst({
//             cacheName: 'static-resources'
//         })
//     );
//
	workbox.routing.registerRoute(/\.(?:ico|jpg|svg|gif|jpeg|png|webp)$/,
	                              new workbox.strategies.CacheFirst({
		                                                                cacheName: 'img-resources'
	                                                                })
	);

	workbox.routing.registerRoute(
	new RegExp('https://randomuser.me/api/.*'),
	new workbox.strategies.CacheFirst({
		                                  cacheName: 'img-resources',
		                                  plugins: [
			                                  new workbox.cacheableResponse.Plugin({
				                                                                       statuses: [0, 200]
			                                                                       })
		                                  ]
	                                  })
	);

	workbox.routing.registerRoute(
	new RegExp('https://jsonplaceholder.typicode.com/posts/.*'),
	new workbox.strategies.NetworkFirst({
		                                    cacheName: 'api-cache',
		                                    plugins: [
			                                    new workbox.cacheableResponse.Plugin({
				                                                                         statuses: [0, 200]
			                                                                         })
		                                    ]
	                                    })
	);


} else
{
	console.log(`Boo! Workbox didn't load 😬`);
}
