// import Vue from 'vue';
// import Vuex from 'vuex';
// import axios from 'axios';
// import {JSONPlaceholderAPI} from "@/services/JSONPlaceholderAPI";
// import {Post} from "@/objects/Post";
//
// const jsonApiService = new JSONPlaceholderAPI();
//
// Vue.use(Vuex, axios);
//
// export default new Vuex.Store(
// {
//   state:
//   {
//     posts: {},
// 	products:
// 	[
// 	  {
// 		id: 0,
// 		sku: "WS12",
// 		title: "Product 1",
// 		price: 20,
// 		mainMedia: ""
//
// 	  }
// 	]
//   },
//   mutations:
// 	{
// 	  SET_POST (state: any, post: Post)
// 	  {
// 	    state.posts[post.getId().toString()] = post;
// 	  }
// 	},
//   actions:
//   {
// 	loadPosts({commit})
// 	{
// 	  jsonApiService.getPost(1).
// 	  then((post) =>
// 		   {
// 			 console.log(post);
// 			 commit('SET_POST', post);
// 		   }).
// 	  catch((error) =>
// 			{
// 			  console.error(error);
// 			});
// 	}
//   },
//
// });
