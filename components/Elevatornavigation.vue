<script setup lang="ts">
import { navigationConfig } from "~/site.config";

const emits = defineEmits(["change"]);
const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0,
  },
});

const { activeIndex } = toRefs(props);

const onChangeIndex = (i: number, key: string) => {
  emits("change", i, key);
};
</script>

<template>
  <div class="navigation z-2">
    <ul
      class="flex gap-0.5em flex-wrap flex-col cursor-pointer border-1 text-lg text-$f"
    >
      <li
        v-for="(navs, index) in navigationConfig"
        :key="navs.key"
        class="py-0.5em px-1em hover:bg-gray-400:10 box-border max-w-31"
        :class="activeIndex === index ? 'text-$f font-bold' : ''"
        @click="onChangeIndex(index, navs.key)"
      >
        {{ navs.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.navigation {
  position: fixed;
  top: 5%;
  width: fit-content;
  transform: translateX(-200%);
}
</style>
