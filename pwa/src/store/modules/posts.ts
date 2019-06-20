// tslint:disable-next-line:import-spacing
import {Post}               from '@/objects/Post';
import {JSONPlaceholderAPI} from '@/services/JSONPlaceholderAPI';

const jsonplaceholderApiService = new JSONPlaceholderAPI();

const posts = {
	namespaced: true,
	state:
	{
		posts: [],
	},
	getters:
	{
		post: (state: any) => (id: number) =>
		{
			return state.posts.find((post: Post) => post.getId() === id);
		},
		allPosts: (state: any) => state.posts,
	},
	actions:
	{
		async fetchPost({commit}: any, id: number)
		{
			// console.log(`Fetching post ${id}...`);
			const post = await jsonplaceholderApiService.getPost(id);
			commit('delPost', post);
			commit('addPost', post);
			// console.log('Fetch post done');
		},
		async deletePost({commit}: any, id: number)
		{
			const post = await jsonplaceholderApiService.getPost(id);
			commit('delPost',post);
		}
	},
	mutations:
	{
		addPost(state: any, post: Post) { state.posts = [...state.posts, post]; }
		,
		delPost(state: any, post: Post)
		{
			// console.log("POST: ", post);
			const index = state.posts.findIndex((item: Post) => item.getId() === post.getId());
			// console.log('Index: ', index);
			if (index !== -1)
			{
				state.posts.splice(index, 1);
			}
		},
	},
};

// };


export default posts;
