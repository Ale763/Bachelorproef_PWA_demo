import axios  from 'axios';
import {Post} from '@/objects/Post';


export class JSONPlaceholderAPI
{
	// =================================================================================================================
	// Data
	private API_BASE = 'https://jsonplaceholder.typicode.com';
	private POSTS_API = this.API_BASE + '/posts';
	private _headers =
	{
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	};
	private _axios: any;
	// =================================================================================================================
	// Getters & Setters

	// =================================================================================================================
	// Constructor
	constructor()
	{
		axios.create({headers: this._headers});
	}

	// =================================================================================================================
	// Main methods

	// -----------------------------------------------------------------------------------------------------------------
	// Products
	public getPost(id: number)
	{
		const url = `${this.POSTS_API}/${id}`;
		try
		{
			return axios.get(url)
			            .then((response: any) =>
			                  {
				                  if ((response.status !== 200 && !navigator.onLine) || response.data === "Offline")
				                  {
					                  console.log("Offline");
					                  throw Error("Offline");
				                  } else if (response.status !== 404)
				                  {
					                  return Post.fromJSON(response.data);
				                  } else
				                  {
					                  throw Error("Requested resource does not exit");
				                  }
			                  })
			            .catch(error =>
			                   {
				                   // console.error("ERROR CATCH", error);
				                   if (!navigator.onLine)
				                   {
					                   throw Error("Offline");
				                   } else
				                   {
					                   console.log("JSONPlaceholderAPI Error", error);
				                   	    throw error
				                   }

			                   }
			            );
		} catch (e)
		{
			console.log("CATCHING: ", e);
			throw e;
		}
	}

	// =================================================================================================================
	// Helper methods
	private checkConnection()
	{

	}
}
