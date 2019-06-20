import Vuex from 'vuex';
import Vue from 'vue';
import posts from './modules/posts';
import products from './modules/products';

Vue.use(Vuex);

const store = new Vuex.Store(
{
	modules:
	{
		posts,
		products,
	},
	state:
	{},
	getters:
	{},
	actions:
	{},
	mutations:
	{},
});

export default store ;
