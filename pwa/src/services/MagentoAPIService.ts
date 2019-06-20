import axios from 'axios';

import { Product } from './../objects/Product';


export class MagentoAPIService
{
	// =================================================================================================================
	// Data
	// TODO: Modify domain api base
	// ! API_BASE MAPPING TO NGINX 
	// static API_BASE = 'https://vuestorefront-demo.phpro.be/rest/V1';
	static API_BASE = 'https://pwa.local:8080/api';
	static PRODUCTS_API = MagentoAPIService.API_BASE + '/products';
	static MEDIA_API = 'https://vuestorefront-demo.phpro.be/pub/media/catalog/product';

	private userAuthToken: string = '6gg6t6uaref3og36p6ukpqy507smw7c4';
	private headers =
		{
			'Content-Type': 'application/json',
			'Credentials': 'include',
			'Authorization': `Bearer ${this.userAuthToken}`,
		};
	private axiosInstance: any;
	// =================================================================================================================
	// Getters & Setters

	// =================================================================================================================
	// Constructor
	constructor()
	{
		this.axiosInstance = axios.create({ headers: this.headers });
	}

	// =================================================================================================================
	// Main methods

	// -----------------------------------------------------------------------------------------------------------------
	// Products
	// public getProductMedia(mediaPath: string) {
	//     const url = `${this.MEDIA_API}/product/${mediaPath}`;
	//     return this.axiosInstance.get(url).then((response: ) => response.data);
	// }

	public async getProductBySKU(sku: string)
	{
		const url = `${MagentoAPIService.API_BASE}/product/${sku}`;
		// return this.axiosInstance.get(url)
		let response = await fetch(url, {credentials: 'omit'}).catch(err => { /* console.error(err); */ return null; });
		if (!response || (response.status < 200 && response.status >=400)) { return response; }
		response = await response.json().catch(err => { /* console.error(err); */ return null; });
		try {
			
			return Product.fromJSON(response);
		} catch (error) {
			return null;
		}
/* 			.then((response: any) =>
		{
			return response.json().then((data: any) => 
			{
				return Product.fromJSON(data);
			}) */
			// let media = response.data.media_gallery_entries[0].file;
			// response.data.media_gallery_entries[0].file = MagentoAPIService.MEDIA_API + media;

		// }).catch(err => { console.log(err); return null; });
	}

	public getProductList(amt: number)
	{
		const url = `${MagentoAPIService.PRODUCTS_API}/?searchCriteria[pageSize]=${amt}`;
		return this.axiosInstance.get(url)
			.then((response: any) =>
			{
				console.log(response);
				return response.data;
			})
			.catch((error: any) =>
			{
				console.log('MAGENTO ERROR: ', error);
			},
			);
	}

	// =================================================================================================================
	// Helper methods
}
