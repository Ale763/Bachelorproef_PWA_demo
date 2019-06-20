import axios from 'axios';

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
			                              // copyStringToClipboard(currentToken);
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
		                               showToken('Error retrieving Instance ID token. ', err);
		                               setTokenSentToServer(false);
	                               });
               })
         .catch(function (err)
                {
	                console.log('Unable to get permission to notify.', err);
                });

messaging.onMessage(function (payload)
                    {
	                    console.log('Message received. ', payload);
                    });

window.addEventListener('notificationclick', function (event)
{
	console.log('On notification click: ', event);
	event.notification.close();
});

function sendNotification(token, payload)
{
	let axiosRequest = {
		method: 'POST',
		url: 'https://fcm.googleapis.com/fcm/send',
		data: {
			"to" : token,
			"collapse_key" : "type_a",
			"notification" :
			{
				"title": payload.title,
				"body" : payload.body,
				"icon": payload.icon,
				"click_action": payload.action
			},
			"data":
			{
				"shown": false
			}

		},
		headers: {
			'Content-Type': 'application/json',
			"Authorization": 'key=AAAAx6AX0WQ:APA91bGRzt5nXLXc1E1zvDat51z-Ys0pKlV0N-Uo1WKjfuB4VAJVYDuiVSXEm1PexQ22kPT6bZcrv1EFOs4J9ebMEYRJThX6Z5kBMDfUXQfyscw7-brEsyd9x6ZEWagbsxssecBRsJwF'
		}
	};
	return axios.post(axios)
	            .then((response) => console.log(response));
}

function showToken(currentToken)
{
	// Show token in console and UI.
	// var tokenElement = document.querySelector('#token');
	// tokenElement.textContent = currentToken;
	console.log("SHOWTOKEN: ", currentToken);
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken)
{
	if (!isTokenSentToServer())
	{
		console.log('Sending token to server...');
		// TODO(developer): Send the current token to your server.
		setTokenSentToServer(true);
	} else
	{
		console.log('Token already sent to server so won\'t send it again ' +
		            'unless it changes');
	}

}

function isTokenSentToServer()
{
	return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent)
{
	window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function requestPermission()
{
	console.log('Requesting permission...');
	// [START request_permission]
	messaging.requestPermission()
	         .then(function ()
	               {
		               console.log('Notification permission granted.');
		               // TODO(developer): Retrieve an Instance ID token for use with FCM.
	               })
	         .catch(function (err)
	                {
		                console.log('Unable to get permission to notify.', err);
	                });
	// [END request_permission]
}

function deleteToken()
{
	// Delete Instance ID token.
	// [START delete_token]
	messaging.getToken()
	         .then(function (currentToken)
	               {
		               messaging.deleteToken(currentToken)
		                        .then(function ()
		                              {
			                              console.log('Token deleted.');
			                              setTokenSentToServer(false);
		                              })
		                        .catch(function (err)
		                               {
			                               console.log('Unable to delete token. ', err);
		                               });
		               // [END delete_token]
	               })
	         .catch(function (err)
	                {
		                console.log('Error retrieving Instance ID token. ', err);
		                showToken('Error retrieving Instance ID token. ', err);
	                });

}
