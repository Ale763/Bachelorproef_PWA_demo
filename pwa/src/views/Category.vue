<template>
<div class="category">
    <v-container grid-list-md>
        <v-layout v-if="offline" row wrap align-center red style="width: 109%;
    margin: 0px;
    position: relative;
    left: -16px;
    color: white;
    top: -16px;">
            <v-flex xs2 style="text-align: center;">
                <v-icon color="white">cloud_off</v-icon>
            </v-flex>
            <v-flex xs10>
                <h2>No network connection. Functionality is limited.</h2>
            </v-flex>
        </v-layout>
        <!-- <h1>Category: {{ this.catId }}</h1> -->
        <v-layout row fill-height wrap>
			<v-flex xs12 style="text-align:center;">

            <div v-if="!loaded">Loading....</div>
			<div v-if="noProducts">This category is empty</div>
			</v-flex>
            <Product v-for="(product, index) in products" v-if="product" :sku="product.getSku()" :key="product.getSku()" style="display: inline-block;" />
        </v-layout>

    </v-container>
</div>
</template>

<script>
import Product from "../components/Product";

import
{
    MagentoAPIService
}
from "../services/MagentoAPIService";

export default
{
    name: "Category",
    components:
    {
        Product,
    },
    props:
    {},
    data()
    {
        return {
            catId: '',
            categorIndex:
            {
                'Women-Tops':
                {
					'products': ['WT09-XS-Purple', 'WT08-XS-Purple', 'WT07-XS-Green', 'WT06-S-Red',
					 'WT05-M-Orange', 'WT04-L-Blue']

                },
                'Women-Bottoms':
                {
                    'products': ['WSH12-28-Green', 'WSH11-28-Red', 'WSH10-28-Black', 'WSH09-28-Green',
                        'WSH08-28-Purple', 'WSH07-28-Black'
                    ]
                },
                'Men-Tops':
                {
                    'products': ['MT12-XL-Blue', 'MT11-M-Blue', 'MT10-XS-Yellow']
                },
                'Men-Bottoms':
                {
                    'products': ['MSH12-32-Red', 'MSH11-34-Black', 'MSH10-36-Green', 'PA01']
                },
                'Men-Accessories':
                {
                    'products': ['MA01', 'MA02']
                },
            },
            offline: false,
            loaded: false,
			products: null,
			noProducts: false
        }
    },
    computed:
    {
        /*         posts: function ()
                {
                    let posts = this.$store.getters['posts/allPosts'];
                    // console.log("All Posts: ", posts);
                    return posts;
                },
                products: function ()
                {
                    let index = this.categorIndex[this.catId]['products'];
                    let filteredProducts = this.$store.getters['products/filterProducts'](index);
                    if (filteredProducts == null)
                    {
                        return [];
                    }
                    this.loaded = true;
                    return filteredProducts;
                } */
    },
    created()
    {
        this.setPageCategory(this.$route.params.catName);
        this.loadCategoryProducts();
    },
    methods:
    {
		testNoProducts()
		{
			if (this.loaded && (this.products == null || this.products === []))
			{
				return true;
			}
			return false;
		},
        getPageCategory()
        {},
        setPageCategory(category)
        {
            this.catId = category;
        },
        fetchProduct(sku)
        {
            return this.$store.dispatch('products/fetchProduct', sku)
                .then((data) =>
                {
                    return data;
                })
                .catch((error) =>
                {
                    if (!navigator.onLine)
                    {
                    }
                    else if (error.message === "Offline")
                    {
                        console.log("Network error: ", error)
                    }
                    else
                        console.error('Fetch error', error);
                });
        },
        async loadCategoryProducts()
        {
            let magentoService = new MagentoAPIService();
            let result = [];
            const categoryProducts = this.categorIndex[this.catId]['products'];
            for (let productSKU of categoryProducts)
            {
				let product = await magentoService.getProductBySKU(productSKU);
				if (product)
                	result.push(product);
                // result.push(this.fetchProduct(productSKU));
			}
			this.loaded = true;
			this.products = result;
			this.noProducts = this.testNoProducts();
        }

    },
    watch:
    {
        $route(to, from)
        {
            this.setPageCategory(to.path.split('/category/')[1]);
            this.loadCategoryProducts();
            console.log("Category route change");

            let pageURL = this.$route.path;
            fetch(pageURL).then(resp => console.log("Background fetched: ", pageURL)).catch(err => console.error(err));
        }
    }
}
</script>

<style scoped>
.category {
    /*max-width: 1000px;*/
    margin: 0 auto;
}

@media only screen and (max-width: 960px) {
    .my-offset-xs1 {
        margin: 0 8.333333333333%;
    }

}
</style>
