<template>
    <div>
        <toolbar></toolbar>
        <settings></settings>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import toolbar from './../container/toolbar.vue';
    import settings from './../container/settings.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        components: {
            toolbar,
            settings,
            bottomBar
        }
    }
</script>