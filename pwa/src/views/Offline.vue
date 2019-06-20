<template>
  <div class="about">
    <h2>This page could not be viewed, because you are offline</h2>
  </div>
</template>

<script>
export default
{
    name: 'Home',
    data()
    {
        return {
            strategy: "none",
            usergroup: "none",
            flag: false,
            sw: null,
            registration: null
        }
    },
    computed:
    {

    },
    async created()
    {
        window.addEventListener('online', () =>
        {
            this.$router.go(-1)
        });

    },
    methods:
    {}
    }
</script>