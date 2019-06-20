import axios from 'axios';

class FirebaseHelper
{
	constructor() {}

	static sendNotification(token, payload)
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
		return axios.post(axiosRequest)
		            .then((response) => console.log(response));
	}
}
