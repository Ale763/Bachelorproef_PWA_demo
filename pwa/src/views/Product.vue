<template>
    <div class="product" v-if="this.product">
        <v-container grid-list-md>
            <v-layout row
                      fill-height
                      wrap>
                <v-flex xs12 md6>
                    <img v-bind:src="this.product.getMainMedia()" style="max-height: 700px; width: 100%;">

                </v-flex>
                <v-flex xs12 md6 style=";">
                    <h1>Product: {{ this.$route.params.sku}}</h1>
                    <v-layout row>
                        <v-flex xs12 md6>
                            SKU: {{ this.product.getSku()}}
                        </v-flex>
                        <v-flex xs12 md6>
                            Price: {{ this.product.getPrice()}}
                        </v-flex>
                    </v-layout>

                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
	import {Product} from "../objects/Product";

	export default {
		name: "Product",
        props: {},
        data()
        {
        	return {
                product: null
            }
        },
        async created()
        {
        	let sku = this.$route.params.sku;
	        let product = this.$store.getters['products/product'](sku);
	        if (product == null)
            {
                product = await this.fetchProduct(sku);
	            // product = this.$store.getters['products/product'](sku);
            }
        	this.product = product
        },
        methods:
        {
	        setPageProduct(product)
	        {
		        this.productId = product;
	        },
            loadProductInformation()
            {

            },
	        fetchProduct(sku)
	        {
		        return this.$store.dispatch('products/fetchProduct', sku)
		            .then((data) =>
		                  {
			                  console.log('Fetch ok', data);
                              return data;
		                  })
		            .catch((error) =>
		                   {
			                   console.error('Fetch error', error);
		                   });
	        },
        }
	}
</script>

<style scoped>
.product
{
    max-width: 1000px;
    margin: 0 auto;
}

@media only screen and (max-width: 960px) {
    .my-offset-xs1 {
        margin: 0 8.333333333333%;
    }

}
</style>
