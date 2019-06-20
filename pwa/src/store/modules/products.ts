// tslint:disable-next-line:import-spacing
import { Product } from '@/objects/Product';
import { MagentoAPIService } from '@/services/MagentoAPIService';

const magentoAPIService = new MagentoAPIService();

const products = {
	namespaced: true,
	state:
	{
		products: [],
	},
	getters:
	{
		product: (state: any) => (sku: string) =>
		{
			return state.products.find((product: Product) => product.getSku() === sku);
		},
		allProducts: (state: any) => state.products,
		filterProducts: (state: any) => (keylist: any) =>
		{
			let result: any = [];
			for(let key of keylist)
			{
				let product = state.products.find((product: Product) => product.getSku() === key);
				if (product != null) result.push(product);
			}
			return result;
		},
	},
	actions:
	{
		async fetchProduct({commit}: any, sku: string)
		{
			// console.log(`Fetching product ${sku}...`);
			const product = await magentoAPIService.getProductBySKU(sku);
			if(product == null)
			{
				return Error("Failed request");
			}
			commit('removeProduct', product);
			commit('addProduct', product);
			return product;
			// console.log('Fetch product done');
		},
		async deleteProduct({commit}: any, sku: string)
		{
			const product = await magentoAPIService.getProductBySKU(sku);
			commit('removeProduct', product);
		},
	},
	mutations:
	{
		addProduct(state: any, product: Product)
		{
			state.products = [...state.products, product];
			}
		,
		removeProduct(state: any, product: Product)
		{
			// console.log('REMOVING PRODUCT: ', product);
			const index = state.products.findIndex(
			(item: Product) => item.getSku() === product.getSku());
			// console.log('Index: ', index);
			if (index !== -1)
			{
				state.products.splice(index, 1);
			}
		},
	},
};

// };


export default products;
