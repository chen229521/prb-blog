<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";

import Social from "./components/Social.vue";

const route = useRoute();
</script>

<template>
  <header class="p-2em">
    <NavBar />
  </header>
  <aside>
    <Social />
  </aside>
  <main class="flex-1 px-7 py-10 w-100%">
    <div
      class="m-auto"
      :class="route.name === 'navigation' ? 'max-w-100ch' : 'max-w-70ch'"
    >
      <slot />
      <Footer />
    </div>
  </main>
</template>
