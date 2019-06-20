<template>
    <div v-if="post" style="padding: 2rem 4rem;">
        <h3>{{ post.getTitle() }}</h3>
        <span>UID: {{ post.getUid() }}</span><br> <span>Id: {{ post.getId() }}</span><br>
        <span>{{ post.getBody() }}</span>
        <v-switch v-model="cached" @click.native="toggleCache();"
                  :label="`Post cached: ${cached.toString()}`"></v-switch>
    </div>
</template>

<script>
	import {mapGetters, mapActions} from 'vuex';

	export default {
		name: "Post",
		props:
		{
			id: Number
		},
		data: function ()
		{
			return {
				cached: false
			}
		},
		computed:
		{
			// ...mapGetters(['post'])
			post()
			{
				let post = this.$store.getters['posts/post'](this.id);
				// console.log("Post is:....", post);
				if (post == null)
					this.fetchPost(this.id);


				return post;
			}
		}
		,
		methods:
		{
			searchCache(id)
            {
	            return window.caches.open('img-resources')
	                  .then( cache =>
	                         {
		                         // console.log("Searching keys for id", id);
		                         // console.log("KEYS", keys);
	                         	return cache.keys().then(urls =>
                                                               {
                                                               	for (let i = 0; i <urls.length; ++i)
                                                                {
                                                                	if (urls[i].url ===
                                                                    `https://jsonplaceholder.typicode.com/posts/${id}`)
                                                                		return true;
                                                                }
                                                               	return false;
                                                               });
	                         }
	                  ).catch(error => {console.error("Error cached", error)})
            },
			// ...mapActions(['posts/fetchPost'])
			fetchPost(id)
			{
				this.send_message_to_sw(this.id);
				this.$store.dispatch('posts/fetchPost', id)
				    .then((data) =>
				          {
					          console.log('Fetch ok', data);
				          })
				    .catch((error) =>
				           {
					           console.error('Fetch error', error);
				           });
			},
			send_message_to_sw(id)
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
						               if (! subscription)
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
								               "id": id
							               }
						               });

					               })
				}
			},
			deletePostFromCache()
			{
				this.send_message_to_sw(this.id);
			},
			toggleCache()
			{
				// event.preventDefault();
                console.log("Firing for post: ", this.id);
				if (this.cached)
				{
					this.deletePostFromCache()
                    // this.cached = false;
				}
				else
				{
					this.fetchPost(this.id)
					// this.cached = true;
				}
				console.log(`Post ${this.id}: Cache = ${this.cached}`);
				// this.cached = !this.cached;
			}

		},
		created()
		{
			const id = this.id;
			return this.searchCache(id).then(result =>
                                             {
                                             	// console.log("Search from cache: ", result);
                                             	if (result != null)
                                                 	this.cached = result;})
			// this.$store.dispatch('posts/fetchPost', this.id);
		}
	}
</script>

<style scoped>

</style>
