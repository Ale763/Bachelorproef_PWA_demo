<template>
<v-navigation-drawer v-model="drawer" absolute temporary="">
    <v-list>
        <v-list-tile to="/">
            <v-list-tile-action>
                <v-icon>home</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Home</v-list-tile-title>
        </v-list-tile>

        <v-list-group prepend-icon="shopping_basket">
            <template v-slot:activator>
                <v-list-tile>
                    <v-list-tile-title>Categories</v-list-tile-title>
                </v-list-tile>
            </template>
            <v-list-group no-action sub-group>
                <template v-slot:activator>
                    <v-list-tile>
                        <v-list-tile-title>Women</v-list-tile-title>
                    </v-list-tile>
                </template>

                <v-list-tile v-for="(woman, i) in women" :key="i" :to="woman[1]">
                    <v-list-tile-title v-text="woman[0]"></v-list-tile-title>
                    <v-list-tile-action>
                        <!--                            <v-icon v-text="woman[1]"></v-icon>-->
                    </v-list-tile-action>
                </v-list-tile>
            </v-list-group>

            <v-list-group no-action sub-group>
                <template v-slot:activator>
                    <v-list-tile>
                        <v-list-tile-title>Men</v-list-tile-title>
                    </v-list-tile>
                </template>

                <v-list-tile v-for="(man, i) in men" :key="i" :to="man[1]">
                    <v-list-tile-title v-text="man[0]"></v-list-tile-title>
                    <v-list-tile-action>
                        <!--                            <v-icon v-text="man[1]"></v-icon>-->
                    </v-list-tile-action>
                </v-list-tile>
            </v-list-group>
        </v-list-group>

        <v-list-tile v-on:click="_navigateTo('/about')">
            <v-list-tile-action>
                <v-icon>account_circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Account</v-list-tile-title>
        </v-list-tile>

        <v-list-group prepend-icon="system_update">
            <template v-slot:activator>
                <v-list-tile>
                    <v-list-tile-title>Updates</v-list-tile-title>
                </v-list-tile>
            </template>

            <v-list-tile v-for="(update, i) in updates" :key="i" v-on:click="_navigateTo(update.path)">

                <v-list-tile-action>
                </v-list-tile-action>
                <v-list-tile-title v-text="update.title"></v-list-tile-title>
            </v-list-tile>
        </v-list-group>

        <v-list-tile v-on:click="_navigateTo('/settings')">
            <v-list-tile-action>
                <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Settings</v-list-tile-title>
        </v-list-tile>
    </v-list>
</v-navigation-drawer>
</template>

<script>
export default
{
    name: "Navbar",
    data()
    {
        return {
            women: [
                ['Tops', '/category/Women-Tops'],
                ['Bottoms', '/category/Women-Bottoms'],
            ],
            men: [
                ['Tops', '/category/Men-Tops'],
                ['Bottoms', '/category/Men-Bottoms'],
                ['Accessories', '/category/Men-Accessories'],
            ],
            updates: [
            {
                path: '/update-without-skip-and-claim',
                title: 'Default'
            },
            {
                path: '/update-with-skip-no-claim',
                title: 'Forced'
            },
            {
                path: '/update-with-skip-and-claim',
                title: 'Forced & immediate control'
            },
            {
                path: '/single-client-update',
                title: 'Single Client'
            },
            {
                path: '/multi-client-update',
                title: 'Multi Client'
            }],
            drawer: false
        }
    },
    created()
    {
        // this.bus.$on('toggleNavbar', this._toggleNavbar());
    },
    methods:
    {
        _toggleNavbar()
        {
            this.drawer = !this.drawer;
        },
        _navigateTo(url)
        {
            window.location = url;
        },
    }
}
</script>

<style scoped>

</style>
