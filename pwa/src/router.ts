import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './views/Home.vue';
import Product from './views/Products.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'Home',
      // redirect: '/category/Men-Bottoms'
      component: Home,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import(/* webpackChunkName: "settings" */ './views/Settings.vue'),
    },
    {
      path: '/offline',
      name: 'Offline',
      component: () => import(/* webpackChunkName: "offline" */ './views/Offline.vue'),
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import(/* webpackChunkName: "products" */ './views/Products.vue'),
    },
    {
      path: '/pr',
      name: 'Pr',
      component: Product,
    },
    {
      path: '/update-without-skip-and-claim',
      name: 'Default update',
      // component: Update,
      component: () => import(/* webpackChunkName: "update" */ './views/Update.vue'),
    },
    {
      path: '/update-with-skip-no-claim',
      name: 'Forced update',
      component: () => import(/* webpackChunkName: "update" */ './views/Update.vue'),
    },
    {
      path: '/update-with-skip-and-claim',
      name: 'Forced update & immediate control',
      component: () => import(/* webpackChunkName: "update" */ './views/Update.vue'),
    },
    {
      path: '/single-client-update',
      name: 'Single client update',
      component: () => import(/* webpackChunkName: "update" */ './views/Update.vue'),
    },
    {
      path: '/multi-client-update',
      name: 'Multi client update',
      component: () => import(/* webpackChunkName: "update" */ './views/Update.vue'),
    },
    {
      path: '/updating',
      name: 'updating',
      component: () => import(/* webpackChunkName: "updateLoader" */ './views/UpdateLoader.vue'),
    },
    {
      path: '/about',
      name: 'Account',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
    {
      path: '/categories',
      component: () => import(/* webpackChunkName: "categories" */ './views/Categories.vue'),
    },
    {
      path: '/category/:catName',
      props: true,
      component: () => import(/* webpackChunkName: "category" */ './views/Category.vue'),
      // component: Category,
    },
    {
      path: '/product/:sku',
      name: 'Product',
      props: true,
      component: () => import(/* webpackChunkName: "product" */ './views/Product.vue'),
      // component: Category,
    },

  ],
});

export default router;
