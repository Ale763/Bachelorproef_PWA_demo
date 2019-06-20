import axios from 'axios';


export class FirebaseService
{
	// =================================================================================================================
	// Data
	public static FIREBASE_API = 'https://fcm.googleapis.com/fcm/send';
	public static HEADERS = {
		'Content-Type': 'application/json',
		'Authorization': 'key=AAAAx6AX0WQ:APA91bGRzt5nXLXc1E1zvDat51z-Ys0pKlV0N-Uo1WKjfuB4VAJVYDuiVSXEm1PexQ22kPT6bZcrv1EFOs4J9ebMEYRJThX6Z5kBMDfUXQfyscw7-brEsyd9x6ZEWagbsxssecBRsJwF'
	};
	// =================================================================================================================
	// Main methods

	public static sendNotificationToSelf( payload: any)
	{
		return axios({
			             method: 'POST',
			             url: FirebaseService.FIREBASE_API,
			             data: payload,
			             headers: FirebaseService.HEADERS,

		             })
		.then(
		(response) =>
		{
			console.log(response);
		})
		.catch(
		(error) =>
		{

			console.error("Notification send error: ", error);
		});
	}


	private userAuthToken: string = '5z2laa967cprzgjfh93666476z8e2bql';
	private headers =
	{
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${this.userAuthToken}`,
	};
	private axiosInstance: any;
	// =================================================================================================================
	// Getters & Setters

	// =================================================================================================================
	// Constructor
	constructor()
	{
		// this.axiosInstance = axios.create({headers: this.headers});
	}

// =================================================================================================================
// Helper methods
}
