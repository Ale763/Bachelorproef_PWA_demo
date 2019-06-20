<template>
<v-flex xs12 sm6 lg4>
    <a v-if="product" v-on:click="_navigate()" style="color: inherit">
        <img :src="product.getMainMedia()" style="max-width:400px;width: 100%; max-height: 600px;">
        <div>
            <h3>{{ product.getName() }}</h3>
            <span style="display: inline-block;">${{ product.getPrice()}}</span>
            <div style="display: inline-block;float: right;position: relative;top: -1.5rem;">
                <v-btn fab
                       dark
                       small
                       color="pink">
                    <v-icon dark>favorite</v-icon>
                </v-btn>
                <v-btn fab
                       dark
                       small
                       color="teal">
                    <v-icon dark>add_shopping_cart</v-icon>
                </v-btn>
            </div>

        </div>
<!--        <span v-if="product.hasTierPrice()">${{ product.getTierPrice()}}</span>-->
<!--        <v-switch v-model="cached"-->
<!--                  @click.native="toggleCache();"-->
<!--                  :label="`Product cached: ${cached.toString()}`"></v-switch>-->
    </a>
</v-flex>
</template>

<script>
import
{
    MagentoAPIService
}
from "../services/MagentoAPIService";
import
{
    Product
}
from "../objects/Product";

const magentoApiService = new MagentoAPIService();

export default
{
    name: "product",
    props:
    {
        sku: String
    },
    data: function ()
    {
        return {
            cached: false,
            product: null
        }
    },
    computed:
    {
        // product()
        // {
        // 	let product = this.$store.getters['products/product'](this.sku);
        // 	if (product == null && this.sku != null)
        // 		this.fetchProduct(this.sku);
        // 	return product;
        // }
    },
    methods:
    {
        _navigate()
        {
            const path = `/product/${this.sku}`;
            this.$router.push(
            {
                path,
                query:
                {
                    t: +new Date()
                }
            });
        },
        searchCache(sku)
        {
            return window.caches.open('products-cache')
                .then(cache =>
                {
                    // console.log("Searching keys for id", sku);
                    // console.log("KEYS", keys);
                    return cache.keys()
                        .then(urls =>
                        {
                            for (let i = 0; i < urls.length; ++i)
                            {
                                if (urls[i].url ===
                                    `${MagentoAPIService.PRODUCTS_API}/${sku}`)
                                    return true;
                            }
                            return false;
                        });
                })
                .catch(error =>
                {
                    console.error("Error cached", error)
                })
        },
        fetchProduct(sku)
        {
            this.send_message_to_sw(this.sku);
            this.$store.dispatch('products/fetchProduct', sku)
                .then((data) =>
                {
                    console.log('Fetch ok', data);
                })
                .catch((error) =>
                {
                    console.error('Fetch error', error);
                });
        },
        send_message_to_sw(sku)
        {
            if ('serviceWorker' in navigator)
            {
                navigator.serviceWorker.ready
                    .then(function (serviceWorkerRegistration)
                    {
                        // Let's see if you have a subscription already
                        return serviceWorkerRegistration.pushManager.getSubscription();
                    })
                    .then(function (subscription)
                    {
                        if (!subscription)
                        {
                            // You do not have subscription
                        }
                        // You have subscription.
                        // Send data to service worker
                        console.log("Sending to SW...");
                        navigator.serviceWorker.controller.postMessage(
                        {
                            "data":
                            {
                                "dev_comm": true,
                                "id": sku
                            }
                        });

                    })
            }
        },
        deleteProductFromCache()
        {
            this.send_message_to_sw(this.id);
        },
        toggleCache()
        {
            // event.preventDefault();
            console.log("Firing for product: ", this.sku);
            if (this.cached)
            {
                this.deleteProductFromCache()
                // this.cached = false;
            }
            else
            {
                this.fetchProduct(this.id)
                // this.cached = true;
            }
            console.log(`Product ${this.id}: Cache = ${this.cached}`);
            // this.cached = !this.cached;
        }

    },
    async created()
    {
        /* return this.searchCache(this.sku)
                   .then(result =>
                         {
        	                 // console.log("Search from cache: ", result);
        	                 if (result != null)

                 this.cached = result;
                         }) */
        // this.$store.dispatch('posts/fetchPost', this.id);
        let magentoService = new MagentoAPIService();
        let product = await magentoService.getProductBySKU(this.sku);
        if (product)
            this.product = product;
    }
}
</script>

<style scoped>

</style>
