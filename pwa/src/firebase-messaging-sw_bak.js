importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');
importScripts('https://www.gstatic.com/firebasejs/5.9.2/firebase.js');

// =====================================================================================================================
// Global configs en initialization
const PREFIX = "PWA";
const PRECACHE = "precache";
const RUNTIME = "runtime";

// =====================================================================================================================
// Firebase
const config = {

	messagingSenderId: "857384407396"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler
         (function (payload)
          {
	          console.log('[firebase-messaging-sw.js] Received background message ', payload);

	          var notificationOptions = {
		          body: payload._notification.body
		          // icon: '/firebase-logo.png'
	          };
	          return self.registration.showNotification(payload._notification.title, notificationOptions);
          });

// =====================================================================================================================
// Event handling

self.addEventListener('push', function (event)
{
	console.log("PUSH", event);

	// Modify original push-event to circumvent bug in Firebase code
	// thanks to https://github.com/firebase/quickstart-js/issues/71
	let e = event;
	if (e.custom) return;

	// Create a new event to dispatch
	var newEvent = new Event('push');
	newEvent.waitUntil = e.waitUntil.bind(e);
	newEvent.data = {
		json: function ()
		{
			var newData = e.data.json();
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

self.addEventListener('push', function (event)
{
	console.log("PUSH", event);
	messaging.setBackgroundMessageHandler
	         (function (payload)
	          {
		          console.log('[firebase-messaging-sw.js] Received background message ', payload);
		          // alert("[firebase-messaging-sw.js] Received background message");
		          // Customize notification here
		          var notificationTitle = 'Background Message Title';
		          var notificationOptions =
		          {
			          body: 'Background Message body.',

			          // icon: '/firebase-logo.png'
		          };
		          return self.registration.showNotification("DUMMY", notificationOptions);
		          // return self.registration.showNotification(notificationTitle,
		          //                                           notificationOptions);
	          });
	// event.notification.close();

	// const myPromise = new Promise(function (resolve, reject)
	//                               {
	// 	                              // Do you work here
	// 	                              console.log('On notification click: ', event);
	// 	                              event.notification.close();
	// 	                              // Once finished, call resolve() or  reject().
	// 	                              resolve();
	//                               });
	//
	// event.waitUntil(myPromise);
});

self.addEventListener('install', (event) =>
{
	// Perform install steps
	console.log("Install");
	// self.skipWaiting();
	const urls = [
		"https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
	];
	const cacheName = workbox.core.cacheNames.runtime;
	event.waitUntil(caches.open(cacheName)
	                      .then((cache) => cache.addAll(urls)));
})

self.addEventListener('fetch', (event) =>
{
	// Handle requests
	console.log("FETCH EVENT", event);

});

self.addEventListener('activate', (event) =>
{
	// Clean up old cache versions
	console.log("activate");
	// self.clients.claim();
})

// =====================================================================================================================
// Workbox

if (workbox)
{
	console.log(`Yay! Workbox is loaded 🎉`);

	// =================================================================================================================
	// Workbox config
	workbox.setConfig(
	{
		debug: true
	});
	// -----------------------------------------------------------------------------------------------------------------
	// Workbox cache config
	workbox.core.setCacheNameDetails(
	{
		prefix: PREFIX,
		precache: PRECACHE,
		runtime: RUNTIME,
	});

	// =================================================================================================================
	// Precaching
	workbox.precaching.precacheAndRoute([])

	// =================================================================================================================
	// Dynamic caching

	workbox.routing.registerRoute(
	new RegExp('https://randomuser.me/api/.*'),
	new workbox.strategies.CacheFirst
	({
		 cacheName: 'img-resources',
		 plugins: [
			 new workbox.cacheableResponse.Plugin
			 ({
				  statuses: [0, 200]
			  })
		 ]
	 })
	);

	workbox.routing.registerRoute(
	new RegExp('https://jsonplaceholder.typicode.com/posts/.*'),
	new workbox.strategies.NetworkFirst
	({
		 cacheName: 'api-cache',
		 plugins: [
			 new workbox.cacheableResponse.Plugin
			 ({
				  statuses: [0, 200]
			  })
		 ]
	 })
	);

	// =================================================================================================================
	// Third party

	// -----------------------------------------------------------------------------------------------------------------
	// Google font stylesheets with stale-while-revalidate
	workbox.routing.registerRoute(
	/^https:\/\/fonts\.googleapis\.com/,
	new workbox.strategies.StaleWhileRevalidate(
	{
		cacheName: 'google-fonts-stylesheets',
	}));

	// -----------------------------------------------------------------------------------------------------------------
	// Google font files cache for 1 full year
	workbox.routing.registerRoute(
	/^https:\/\/fonts\.gstatic\.com/,
	new workbox.strategies.CacheFirst
	({
		 cacheName: 'google-fonts-webfonts',
		 plugins: [
			 new workbox.cacheableResponse.Plugin
			 ({
				  statuses: [0, 200],
			  }),
			 new workbox.expiration.Plugin
			 ({
				  maxAgeSeconds: 60 * 60 * 24 * 365,
				  maxEntries: 30,
			  }),
		 ],
	 })
	);

	// workbox.routing.registerRoute(
	// /^https:\/\/fonts\.googleapis\.com\/css\?family=Roboto:100,300,400,500,700,900\|Material\+Icons/,
	// new workbox.strategies.CacheFirst
	// ({
	// 	 cacheName: 'google-fonts-webfonts',
	// 	 plugins: [
	// 		 new workbox.cacheableResponse.Plugin
	// 		 ({
	// 			  statuses: [0, 200],
	// 		  }),
	// 		 new workbox.expiration.Plugin
	// 		 ({
	// 			  maxAgeSeconds: 60 * 60 * 24 * 365,
	// 			  maxEntries: 30,
	// 		  }),
	// 	 ],
	//  })
	// );

	// =================================================================================================================
	// Media
	workbox.routing.registerRoute(
	/\.(?:ico|jpg|svg|gif|jpeg|png|webp)$/,
	new workbox.strategies.CacheFirst
	({
		 cacheName: 'img-resources'
	 })
	);
} else
{
	console.log(`Boo! Workbox didn't load 😬`);
}
