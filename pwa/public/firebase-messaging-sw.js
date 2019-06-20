importScripts('https://www.gstatic.com/firebasejs/5.9.2/firebase.js');
importScripts(`/modules/cacheLib.js`);
// // =====================================================================================================================
// // Firebase
// const config = { messagingSenderId: "857384407396" };
// firebase.initializeApp(config);
// const messaging = firebase.messaging();

// messaging
// .setBackgroundMessageHandler
// (function (payload)
//  {
// 	 console.log('[firebase-messaging-sw.js] Received background message ', payload);

// 	 var notificationOptions = {
// 		 body: payload._notification.body,
// 		 icon: payload._notification.icon,
// 	 };
// 	 payload.data.shown = true;
// 	 console.log("Notification arrived")
// 	 return self.registration.showNotification(payload._notification.title, notificationOptions);
//  });

var config = {

	messagingSenderId: "857384407396"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

// ---------------------------------------------------------------------------------------------------------------------
// Push

self.addEventListener('push', async function (event)
{
	// Modify original push-event to circumvent bug in Firebase code
	// thanks to https://github.com/firebase/quickstart-js/issues/71
	console.log("Notification arrived")
	let e = event;
	if (e.custom) return;
	// Create a new event to dispatch
	let newEvent = new Event('push');
	newEvent.waitUntil = e.waitUntil.bind(e);
	newEvent.data = {
		json: async function ()
		{
			let newData = await e.data.json();
			newData._notification = newData.notification;

			if (newData.data && newData.data.cacheURL)
			{
				event.waitUntil(cache(newData.data.cacheURL));
			}

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

async function cache(url)
{
	let request = new Request(url);
	let response = await CacheLib.defaulThirdPartytFallbackStrategy(request);
	CacheLib.addToCache(request.clone(), response.clone(), 'products');
}


messaging.setBackgroundMessageHandler
	(function (payload)
	{
		console.log('[firebase-messaging-sw.js] Received background message ', payload);

		// Customize notification here
		var notificationOptions = {
			body: payload._notification.body
			// icon: '/firebase-logo.png'
		};
		return self.registration.showNotification(payload._notification.title, notificationOptions);
		// return self.registration.showNotification(notificationTitle,
		//                                           notificationOptions);
	});