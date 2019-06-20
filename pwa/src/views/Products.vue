<template>
    <div class="products-container">
        <!--                <h1>Posts</h1>-->
        <!--                <Post v-for="(post, index) in posts" :key="index" v-bind:id="post.getId()" />-->

        <h1>Products</h1>
        <Product v-for="(product, index) in products"
                 :key="product.getSku()"
                 v-bind:sku="product.getSku()"
                 style="display: inline-block;max-width: 30%;vertical-align: top;"/>
        <!--                <Product v-bind:id="24-MB01" />-->
<!--        <img src="/img/qhd.png">-->
    </div>
</template>

<script>
	import Product from "../components/Product";
	import Post from '../components/Post'
	import {MagentoAPIService} from "../services/MagentoAPIService";

	export default {
		name: "Products",
		components: {
			Product,
			Post
		},
		data()
		{
			return {
				products: null
			}
		},
		computed:
		{
			// posts: function ()
			// {
			// 	let posts = this.$store.getters['posts/allPosts'];
			// 	// console.log("All Posts: ", posts);
			// 	return posts;
			// },
			// products: function ()
			// {
			// 	let products = this.$store.getters['products/allProducts'];
			// 	// console.log("All Posts: ", posts);
			// 	return products;
			// }
		},
		created()
		{
			// const magentoAPI = new MagentoAPIService();
			// const products = magentoAPI.getProductList(15);
			//
			// let thisAlias = this;
			// let url_string = window.location.href;
			// var url = new URL(url_string);
			// var c = url.searchParams.get("post");
			// if (c != null && !isNaN(c))
			// {
			// 	console.log(c);
			// 	this.fetchPost(c);
			// }
			// this.fetchPost(1);
			// this.fetchPost(2);
			// this.fetchPost(3);
			//
			// url_string = window.location.href;
			// url = new URL(url_string);
			// c = url.searchParams.get("product");
			// if (c != null && !isNaN(c))
			// {
			// 	console.log(c);
			// 	this.fetchPost(c);
			// }
			// this.fetchProduct("24-MB01");
			// this.fetchProduct("WS12");
		},
        methods:
        {
	        fetchPost(id)
	        {
		        this.$store.dispatch('posts/fetchPost', id)
		            .then((data) =>
		                  {
			                  console.log('Fetch ok', data);
		                  })
		            .catch((error) =>
		                   {
			                   if (error.message === "Offline")
			                   {
				                   console.log("Network error: ", error)
			                   } else
				                   console.error('Fetch error', error);
		                   });
	        },
	        fetchProduct(sku)
	        {
		        this.$store.dispatch('products/fetchProduct', sku)
		            .then((data) =>
		                  {
			                  console.log('Fetch ok', data);
		                  })
		            .catch((error) =>
		                   {
			                   if (error.message === "Offline")
			                   {
				                   console.log("Network error: ", error)
			                   } else
				                   console.error('Fetch error', error);
		                   });
	        },
        }
	}
</script>

<style scoped>

</style>
