---
title: 海康ar对接
date: 2024-03-04
---
### 海康ar对接

```javascript
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import emits from '@/utils/emits';
import { getDictByCode } from '@/api/system';
const control = ref<any>(null)
let setUpInfo = {
    ip: '10.100.50.37',
    port: '443',
    username: 'admin',
    password: 'yykj@2022'
}
const { ARWebControl, ARControls } = window.har
const router = useRouter()
const loading = ref(false)
const errorText = ref('')
onMounted(() => {
    const isChrome = window.navigator.userAgent.indexOf('Chrome') !== -1
    if (isChrome) {
        init()
        registerEvent('ar_connect_timeout')
        registerEvent('ar_ui_loaded')
        registerEvent('ar_keydown')
        registerEvent('ar_closed')
        setupAR()
    } else {
        ElMessageBox.confirm('AR实景地图应用不支持该浏览器，请使用Chrome浏览器打开该应用!', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            beforeClose: (action, instance, done) => {
                router.go(-1)
                done()
            }
        })
    }
    emits.on('SWITCH_AR_STATUS', switchArStatus)
    showAR()
})
const init = () => {
    control.value = ARWebControl.getInstance()
}
const setupAR = () => {
    loading.value = true
    console.log('开始初始化ar==============');
    getDictByCode({
        "code": "",
        "typeCode": "HK_LOGIN_INFO",
        "typeCodeList": []
    }).then(res => {
        // let codeList = ['IP', 'PORT', 'USERNAME', 'PASSWORD']
        let data: [] = res.data
        let infoObj = {}
        data.forEach((item: any) => {
            infoObj[item.code] = item.name
        })
        console.log(infoObj);
        control.value
            ?.setup({
                ip: infoObj['IP'], //平台IP
                port: infoObj['PORT'], //平台端口
                userName: infoObj['USERNAME'], //用户名
                credentials: infoObj['PASSWORD'], //登录凭据
                domId: 'ar-div', //渲染容器
                loginType: 0, //登录方式 0-明文登录；1-密文登录
                setupType: 2, //客户端启动类型 1-非网页启动；2-网页启动
                domainId: 0, //网域Id
                arIndexCode: '', //AR高点编号
                wsPort: 9999, //控件WS端口
                visible: true //控件拉起时是否显示
                // hiddenControls: [ARControls.BUTTONS_EXIT_MIN], //隐藏内部控件列表
                // processName: 'chrome.exe' //进程名称
            })
            .then(() => {
                console.log('AR控件启动成功')
            })
            .catch((err: any) => {
                console.error(err.msg)
                console.log('AR控件启动失败')
            })
            .finally(() => {
                loading.value = false
            })
    })
    // getHKSetupInfo()
    //     .then(({ data }) => {
    //         if (data) {
    //             control.value
    //                 ?.setup({
    //                     ip: data.ip, //平台IP
    //                     port: data.port, //平台端口
    //                     userName: data.username, //用户名
    //                     credentials: data.password, //登录凭据
    //                     domId: 'ar-div', //渲染容器
    //                     loginType: 0, //登录方式 0-明文登录；1-密文登录
    //                     setupType: 2, //客户端启动类型 1-非网页启动；2-网页启动
    //                     domainId: 0, //网域Id
    //                     arIndexCode: '', //AR高点编号
    //                     wsPort: 9999, //控件WS端口
    //                     visible: true //控件拉起时是否显示
    //                     // hiddenControls: [ARControls.BUTTONS_EXIT_MIN], //隐藏内部控件列表
    //                     // processName: 'chrome.exe' //进程名称
    //                 })
    //                 .then(() => {
    //                     console.log('AR控件启动成功')
    //                 })
    //                 .catch((err: any) => {
    //                     console.error(err.msg)
    //                     console.log('AR控件启动失败')
    //                 })
    //                 .finally(() => {
    //                     loading.value = false
    //                 })
    //         } else {
    //             loading.value = false
    //             errorText.value = '连接服务端失败，请检查网络'
    //             console.log('连接失败');
    //         }
    //     })
    //     .catch(() => {
    //         loading.value = false
    //     })
}
const registerEvent = (eventName: string) => {
    control.value.on(eventName, (msg: any) => {
        switch (eventName) {
            case 'ar_connect_timeout':
                errorText.value = '连接AR客户端失败，请先检查本地是否安装AR客户端再尝试刷新页面重新加载'
                break
            case 'ar_ui_loaded':
                // // 隐藏内部控件
                // control.value.setControlsVisibility([
                //   ARControls.SCENE_TREE, // 场景树列表
                //   ARControls.MAP, // 地图控件
                //   ARControls.BUTTONS_BOTTOM, // 底部按钮组
                //   ARControls.BUTTONS_EXIT_MIN, // 右上方最小化和退出按钮
                //   ARControls.SEARCH_BAR, // 右侧标签搜索栏
                //   ARControls.BUTTON_ALARM, // 右上方报警按钮
                //   ARControls.TOOLBOX_RIGHT // 右侧工具箱控
                // ])
                break
            case 'ar_keydown':
                console.log(`AR内按键触发：${msg}`)
                break
            case 'ar_closed':
                // window.close()
                console.log('关闭');
                break
        }
    })
}
const closeAR = () => {
    control.value
        ?.close()
        .then(() => {
            console.log('AR控件关闭成功')
        })
        .catch((err: any) => {
            console.error(err.msg)
            console.log('AR控件关闭失败')
        })
}
const hideAR = () => {
    control.value?.setARShowMode(true)
}
const showAR = () => {
    control.value?.setARShowMode(false)
}
const switchArStatus = (bool: Boolean) => {
    // setTimeout(() => {
    //   control.value?.setARShowMode(!bool)
    // }, 100)
    control.value?.setARShowMode(!bool)
}
onBeforeUnmount(() => {
    emits.off('SWITCH_AR_STATUS', switchArStatus)
    hideAR()
    closeAR()
})
defineExpose({
    control,
    hideAR,
    showAR
})
</script>
<template>
    <div id="ar-div" v-loading="loading" element-loading-text="加载中……" element-loading-background="transparent">
        <div class="error-text">{{ errorText }}</div>
    </div>
</template>
<style scoped lang="scss">
#ar-div {
    height: calc(100% - 6vh);
    width: 100%;
    min-width: 800px;
    // min-height: 600px;
    position: relative;
    background-color: black;
    margin-top: 6vh;
    .error-text {
        color: #8c8c8c;
        opacity: 0.8;
        font-size: 16px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        text-align: center;
    }
}
</style>

```

### web端对接海康控件

```javascript

import { reactive } from "vue";
var g_iWndIndex = 0;
export const data = reactive({
    ip: '10.100.50.72', //你的ip
    port: '80',
    userName: 'admin',//账号
    password: 'yyit2022', //密码
    img: ''
})
// 初始化插件参数及插入插件
export const init = (domid) => {
    WebVideoCtrl.I_InitPlugin({
        bWndFull: true,     //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
        iWndowType: 1,
        cbSelWnd: function (xmlDoc) {
            g_iWndIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
        },
        cbDoubleClickWnd: function () {
        },
        cbEvent: (iEventType, iParam1) => {
            if (2 == iEventType) {// 回放正常结束
                console.log("窗口" + iParam1 + "回放结束！")
            } else if (-1 == iEventType) {
                console.log("设备" + iParam1 + "网络错误！")
            }
        },
        cbInitPluginComplete: function () {
            WebVideoCtrl.I_InsertOBJECTPlugin(domid).then(() => {
                // 检查插件是否最新
                WebVideoCtrl.I_CheckPluginVersion().then((bFlag) => {
                    if (bFlag) {
                        alert("检测到新的插件版本，双击开发包目录里的HCWebSDKPlugin.exe升级！");
                    } else {
                        console.log('初始化成功')
                        login()
                    }
                });
            }, () => {
                alert("插件初始化失败，请确认是否已安装插件；如果未安装，请双击开发包目录里的HCWebSDKPlugin.exe安装！");
            });
        }
    });
}
// 抓图
export const capturePicData = (type) => {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex)
    if (oWndInfo != null) {
        WebVideoCtrl.I_CapturePicData().then((res) => {
            data.img = "data:image/jpeg;base64," + res
        }, function () {
        });
    }
}
// 销毁插件
export const destroyPlugin = () => {
    WebVideoCtrl.I_Logout(`${data.ip}_${data.port}`).then(() => {
        console.log('退出成功')
        WebVideoCtrl.I_DestroyPlugin()
    }, () => {
        console.log('退出失败！')
    });
}
//  登录
export const login = () => {
    WebVideoCtrl.I_Login(data.ip, 1, data.port, data.userName, data.password, {
        timeout: 3000,
        success: function (xmlDoc) {
            getDevicePort(`${data.ip}_${data.port}`);  //获取端口
        },
        error: function (error) {
            console.log(error)
            if (error.errorCode == 2001) {
                getDevicePort(`${data.ip}_${data.port}`);
            }
        }
    });
}
// 获取端口
export const getDevicePort = (szDeviceIdentify) => {
    if (!szDeviceIdentify) {
        return;
    }
    WebVideoCtrl.I_GetDevicePort(szDeviceIdentify).then((oPort) => {
        console.log('登录成功', oPort)
        // startRealPlay()
    }, (oError) => {
    });
}
// 开始预览
export const startRealPlay = () => {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex)
    var startRealPlay = function () {
        WebVideoCtrl.I_StartRealPlay(`${data.ip}_${data.port}`, {
            iStreamType: 1,
            iChannelID: 1,//播放通道
            bZeroChannel: false,
            success: function () {
                console.log(" 开始预览成功！")
            },
            error: function (oError) {
                console.log(" 开始预览失败！", oError.errorMsg)
            }
        });
    };
    if (oWndInfo != null) {// 已经在播放了，先停止
        WebVideoCtrl.I_Stop({
            success: () => {
                startRealPlay();
            }
        });
    } else {
        startRealPlay();
    }
}
//  格式化时间
export const dateFormat = (oDate, fmt) => {
    var o = {
        "M+": oDate.getMonth() + 1, //月份
        "d+": oDate.getDate(), //日
        "h+": oDate.getHours(), //小时
        "m+": oDate.getMinutes(), //分
        "s+": oDate.getSeconds(), //秒
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
        "S": oDate.getMilliseconds()//毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
export const changeWndNum = (iType) => {
    iType = parseInt(iType, 10);
    WebVideoCtrl.I_ChangeWndNum(iType).then(() => {
    }, (oError) => {
    });
}
export const clickStopRealPlay = () => {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";
    if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
            success: function () {
            },
            error: function (oError) {
            }
        });
    }
}




<template>
  <div :id="domid" class="plugin" ref="videoPlayer"></div>
  <div>
    <button @click="startRealPlay()">预览</button>
    <button @click="changeWndNum(2)">分割</button>
    <button @click="clickStopRealPlay()">停止播放</button>
    <!-- <button @click="destroyPlugin">销毁</button> -->
  </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { init, changeWndNum, startRealPlay, clickStopRealPlay } from "./hkplay";
const videoPlayer = ref<HTMLDivElement | null>(null);
let domid = ref<string>("");
function initDemo() {
  domid.value = "divPlugin" + Math.floor(Math.random() * 8000);
}
onBeforeMount(() => {
  initDemo();
  init(domid.value);
});
</script>
<style scoped>
.plugin {
  width: 1600px;
  height: 800px;
}
</style>


```
