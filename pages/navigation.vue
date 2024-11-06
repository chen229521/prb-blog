<script setup lang="ts">
import { navigationConfig } from "@/site.config";
// import { isClient } from "@vueuse/core";

const activeIndex = ref(0);
const navigation = ref<HTMLElement | null>(null);
const elev = ref<HTMLElement | null>(null);
const handleChange = (i: number, key: string) => {
  activeIndex.value = i;
  // 让对应的元素滚动到视图区
  document.getElementById(key)?.scrollIntoView({
    behavior: "smooth",
  });
};

const navHeightArr = ref<Array<number>>([]);
const { y } = useWindowScroll();
const offsetTop = ref(0);
const handleScroll = () => {
  requestAnimationFrame(() => {
    // 防止模块高度计算未完成
    if (navHeightArr.value.length === navigationConfig.length) {
      let index = navHeightArr.value.findIndex(
        (item) => y.value - offsetTop.value < item
      );
      console.log(y.value - offsetTop.value);

      if (index > -1) {
        activeIndex.value = index;
      }
    }
  });
};

const handleNavHeight = () => {
  const navArr = navigation.value?.getElementsByClassName("navItem") as any;
  offsetTop.value = navArr[0].offsetTop;
  let height = 0;
  navigationConfig.forEach((item, index) => {
    height += navArr[index].clientHeight;
    navHeightArr.value.push(height);
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, false);
  handleNavHeight();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll, false);
});
</script>

<template>
  <Elevatornavigation
    :active-index="activeIndex"
    class="hidden 2xl:flex"
    @change="handleChange"
    ref="elev"
  />
  <div ref="navigation">
    <h1 class="text-title mb-2em font-bold text-center">Navigation</h1>
    <article
      v-for="(navs, index) in navigationConfig"
      :key="index"
      slide-enter
      :style="{ '--stagger': index + 1 }"
      :id="navs.key"
      class="navItem"
    >
      <div class="text-center mt-2em mb-1em text-$f" font-bold text-lg>
        {{ navs.name }}
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-1em">
        <a
          v-for="nav in navs.content"
          :key="nav.link"
          :title="nav.name"
          :href="nav.link"
          target="_blank"
          class="flex items-center py-0.5em px-1em rounded-sm hover:bg-gray-400:10"
        >
          <div class="hover w-full">
            <div class="flex items-center gap-2 text-md">
              <span class="text-sm"
                ><img
                  :src="`https://icon.bqb.cool/?url=${nav.link}`"
                  :alt="nav.name"
                  loading="lazy"
                  class="link-icon"
                />
              </span>
              {{ nav.name }}
            </div>
          </div>
        </a>
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
.link-icon {
  width: 1.125rem;
  height: 1.125rem;
}
</style>
