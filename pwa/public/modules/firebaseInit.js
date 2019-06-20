// import firebaseLib from '/modules/firebaseLib.js';

var config = {
	apiKey: "AIzaSyAyGInviSJMCyZV_XHLIRa8fKAt-wsaAJA",
	authDomain: "pwademo-763.firebaseapp.com",
	databaseURL: "https://pwademo-763.firebaseio.com",
	projectId: "pwademo-763",
	storageBucket: "pwademo-763.appspot.com",
	messagingSenderId: "857384407396"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BHEX_KV05JO3refzgJbNXaXObnSiCb2kjx1rOsLWhMon4dea2ddfiYD0iLBHm6DsQkVp8sCLr2Ypuuz6haDnOzo");
messaging.requestPermission()
         .then(function ()
               {
	               console.log('Notification permission granted.');
	               // TODO(developer): Retrieve an Instance ID token for use with FCM.
	               // ...
	               messaging.getToken()
	                        .then(function (currentToken)
	                              {
		                              if (currentToken)
		                              {
			                              console.log("TOKEN: ", currentToken);
			                              firebaseLib.copyStringToClipboard(currentToken);
			                              // sendTokenToServer(currentToken);
			                              // updateUIForPushEnabled(currentToken);
		                              } else
		                              {
			                              // Show permission request.
			                              console.log('No Instance ID token available. Request permission to generate one.');
			                              // Show permission UI.
			                              // updateUIForPushPermissionRequired();
			                              // setTokenSentToServer(false);
		                              }
	                              })
	                        .catch(function (err)
	                               {
		                               console.log('An error occurred while retrieving token. ', err);
		                               firebaseLib.showToken('Error retrieving Instance ID token. ', err);
		                               firebaseLib.setTokenSentToServer(false);
	                               });
               })
         .catch(function (err)
                {
	                console.log('Unable to get permission to notify.', err);
                });

messaging.onMessage(function(payload) {
	console.log('Message received. ', payload);
});

window.addEventListener('notificationclick', function(event)
{
	console.log('On notification click: ', event);
	event.notification.close();
});
