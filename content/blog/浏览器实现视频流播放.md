---
title: 浏览器实现视频流播放
date: 2024-03-04
---

```javascript
1.webrtc视频流组件

<template>
  <div class="video-player">
    <video
      ref="videoRef"
      class="video-js vjs-default-skin"
      autoplay
      muted
      @dblclick="fullScreenVide"
      controls
    ></video>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  onUnmounted,
  nextTick,
  watch,
  toRefs,
  watchEffect,
  onMounted,
} from "vue";
import "@/utils/webRtc/adapter.min.js";
import { getDictDataList } from "@/utils/tool";
import { WebRtcStreamer } from "@/utils/webRtc/webrtcstreamer";
import emits from "@/utils/emits";
const props = defineProps({
  src: {
    type: String,
    default: () => "",
  },
  label: {
    type: String,
    default: () => "",
  },
  type: {
    type: Number || String,
    default: () => 0,
  },
  status: {
    type: Boolean,
    default: () => true,
  },
  showDetail: {
    type: Boolean,
    default: () => false,
  },
});
const webrtcConfig = {
  url: "",
  options: "rtptransport=tcp&timeout=60",
  layoutextraoptions: "&width=320&height=0",
  defaultvideostream: "Bunny",
};
const rtcIP = ref(getDictDataList("WEB_RTC_URL")[0].name);
const videoRef = ref(null);
const webRtcServer = ref() as any;
const isRtsp = (src: string) => {
  return src && src.substring(0, 4) === "rtsp";
};
const fomatterRef = () => {
  if (location.host.includes("localhost")) {
    return rtcIP.value;
  } else {
    return "http://10.100.50.67/webrtc";
  }
};
const switchSource = (src: string) => {
  // 解决控制台报错
  nextTick(() => {
    if (videoRef.value) {
      if (isRtsp(src)) {
        webRtcServer.value && webRtcServer.value.disconnect();
        //192.168.1.100是启动webrtc-streamer的服务器IP，8000是webrtc-streamer的默认端口号，可以在服务端启动的时候更改的
        // uerStore.rtcIP
        webRtcServer.value = new WebRtcStreamer(videoRef.value, rtcIP.value);
        //需要看的rtsp视频地址，可以在网上找在线的rtsp视频地址来进行demo实验，在vlc中能播放就能用
        // webRtcServer.connect('rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4')
        webRtcServer.value.connect(src, null, webrtcConfig.options);
        // webRtcServer.value.connect(webrtcConfig);
      }
    }
  });
};
const fullScreenVide = () => {
  if (videoRef.value.requestFullscreen) {
    videoRef.value.requestFullscreen();
  } else if (videoRef.value.mozRequestFullScreen) {
    /* Firefox */
    videoRef.value.mozRequestFullScreen();
  } else if (videoRef.value.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    videoRef.value.webkitRequestFullscreen();
  } else if (videoRef.value.msRequestFullscreen) {
    /* IE/Edge */
    videoRef.value.msRequestFullscreen();
  }
};
// 监控props中监控弹窗的变化来销毁视频流
const { status } = toRefs(props);
watch(
  () => status.value,
  (newVal) => {
    if (!newVal) {
      closeVideo();
    } else {
      switchSource(props.src);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
watchEffect(() => {
  nextTick(() => {
    switchSource(props.src);
  });
});
const closeVideo = () => {
  if (webRtcServer.value) {
    webRtcServer.value.disconnect();
    webRtcServer.value = null;
    console.log(
      "==========================父组件触发关闭视频流==========================="
    );
  }
};
onMounted(() => {
  emits.on("CLOSE_VIDEO", closeVideo);
});
onUnmounted(() => {
  closeVideo();
  emits.off("CLOSE_VIDEO", closeVideo);
});
</script>
<style lang="scss" scoped>
.video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  .video-js {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    z-index: 2;
  }
  .offvideo {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1f1f1f;
  }
  .video-address-box {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 30px;
    background: rgba(0, 0, 0, 0.68);
    color: white;
    z-index: 3;
    .video-address-box-ul {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      box-sizing: border-box;
      .video-address-box-li {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        &:nth-child(1) {
          width: 150px;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>


```