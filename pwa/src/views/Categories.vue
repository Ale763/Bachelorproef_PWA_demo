<template>
    <div class="categories">
        <h1>Categories</h1>
        <v-container grid-list-md text-xs-center>
            <v-layout justify-center row fill-height>
                <v-flex v-for="i in 3" :key="`4${i}`" xs4>
                    <v-card dark color="primary">
                        <v-card-text class="px-0">4</v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
	export default {
		name: "Categories.vue"
	}
</script>

<style scoped>
.categories
{
    max-width: 1000px;
    margin: 0 auto;
}
</style>
