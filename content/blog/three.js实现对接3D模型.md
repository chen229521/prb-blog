---
title: three.js实现对接3D模型
date: 2024-09-07
---

```javascript

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, h, toRefs, nextTick, watch, markRaw, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { SelectionBox } from 'three/addons/interactive/SelectionBox.js'
import { SelectionHelper } from 'three/addons/interactive/SelectionHelper.js'
import ponitMark from './components/mark.vue'
import { Right } from '@element-plus/icons-vue'
// import { DeviceMark } from './'
import {
  doorMarkList,
  monitorMarkList,
  regionMarkList
} from './config/point'
import { dgGetDoorList, getUnhandleFlagByCode, getUnhandledAlertMessage } from '@/api/dashboard'
import { getDeviceList } from '@/api/dashboard-dggw'
import emits from '@/utils/emits'
import { useDashboardStore } from '@/stores/dashboard'
import TWEEN from '@tweenjs/tween.js'
import { number } from 'echarts'
import { object } from 'vue-types'

const deviceOptions = reactive<any>({
  doorOptions: doorMarkList,
  monitorOptions: monitorMarkList,
  warningOptions: []
})
const markOption = reactive<any>({
  data:regionMarkList
})
const progress = ref(0)
const showProgress = ref(true)
let group: any // 3d模型
let warnLabelList: any = {}
const props = defineProps({
  useSelect: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['changeIndoor', 'changeUseSelect'])
const PointType = ref('all')
const showAlert = (data: any) => {
  console.log('321');
     deviceOptions.monitorOptions.forEach((item:any,index:number) => {
    // markRef[index].style.display = 'none'
    item.showPoint = false;
  })
  console.log(deviceOptions.monitorOptions);
}
const showAll = (data:any) => {
    deviceOptions.monitorOptions.forEach((item:any,index:number) => {
    // markRef[index].style.display = 'none'
    item.showPoint = true;
  })
  console.log(deviceOptions.monitorOptions);
  console.log('123');
  PointType.value = 'all'
}
onMounted(() => {
  init()
  render()
  // 订阅设备告警消息通知
  emits.on("CHANGE_ALERT",showAlert)
  emits.on("CHANGE_ALL",showAll)
  emits.on('ALERT_MESSAGE', onAlertMessage)
  // 订阅设备告警处理通知
  emits.on('HANDLE_MESSAGE', onHandleMessage)
})
// const deviceOptions = reactive<any>({
//   doorOptions: doorMarkList,
//   monitorOptions: monitorMarkList,
//   warningOptions: []
// })
// 获取点位门禁列表
// const getDoorListFun = async () => {
//   await dgGetDoorList({}).then(({ data }: any) => {
//     if (data && data.length) {
//       setMarkOptionsData(data, 'doorOptions')
//     }
//   })
// }
// 获取点位监控列表
const getMonitorListFun = async () => {
  await getDeviceList({ regionCode: '东莞港智慧港区', type: '监控设备' }).then(({ data }: any) => {
    if (data && data.length) {
      setMarkOptionsData(data, 'monitorOptions')
    }
  })
}
// 把监控子集和为整体的数据
let allMonitorOptions: any = []
const getAllMonitorOptions = () => {
  // 编辑监控设备子级
  deviceOptions.monitorOptions.forEach((device: any) => {
    if (device.children?.length) {
      device.children.forEach((child: any) => {
        allMonitorOptions.push({ ...child, position: device.position })
      })
    } else {
      allMonitorOptions.push(device)
    }
  })
//   // 加入二级页面的监控
  markOption.data.forEach(async item => {
    if (!item.isAddMonitor) {
      return
    }
    await getDeviceList({ regionCode: item.orientation, type: '监控设备' }).then(
      ({ data = [] }) => {
        data = data.map((item2: any) => {
          return {
            ...item2,
            position: item.position,
            equipmentId: item2.id,
            name: item2.name,
            location: item2.equipmentLocationCode,
            orientation: item.orientation,
            type: 'label'
          }
        })
        allMonitorOptions.push(...data)
        getUnhandledAlertMessageFun()
      }
    )
  })
}
const alertList = ref([])
// 获取未处理告警消息列表
const getUnhandledAlertMessageFun = async () => {
  deviceOptions.warningOptions = []
  for (let key in warnLabelList) {
    group && group.remove(warnLabelList[key])
    delete warnLabelList[key]
  }
  let allDeviceOptions = [...deviceOptions.doorOptions, ...allMonitorOptions]
  await getUnhandledAlertMessage().then(({ data }: any) => {

    data = data.filter((e: any) => e.alertGrade !== 'INFO')
    allDeviceOptions.forEach((dItem: any) => {
      data.forEach((item: any) => {
        // if (item.equipmentId === dItem.equipmentId) {
        if (item.equipmentName === dItem.name && item.equipmentLocationCode === dItem.location) {
          const newItem = { ...dItem, ...item }
          alertList.value.push(item)
          deviceOptions.warningOptions.push(newItem)
          console.log(deviceOptions.warningOptions,'初始化的告警');
        }
      })
    })
    // 将id相同的告警信息去重
    alertList.value = alertList.value.filter((item: any, index: number) => {
      return alertList.value.findIndex((item2: any) => item.alertMessageId === item2.alertMessageId) === index
    })
        console.log(alertList.value,'东莞港');
    setLabelFun('warningOptions', '#warningMark_', 'alertMessageId')
  })
}
// 刷新未处理告警消息列表
const refreshAlertMessage = () => {
  getUnhandledAlertMessageFun()
}
// 给点位数据添加后端数据
const setMarkOptionsData = (data: any, deviceType: string) => {
  deviceOptions[deviceType].forEach((dItem: any) => {
    data.forEach((item: any) => {
      if (dItem.children?.length) {
        dItem.children.forEach((child: any) => {
          if (item.name === child.name && item.equipmentLocationCode === child.location) {
            Object.assign(child, item)
            child.equipmentId = item.id
          }
        })
      } else if (item.name === dItem.name && item.equipmentLocationCode === dItem.location) {
        Object.assign(dItem, item)
        dItem.equipmentId = item.id
      }
    })
  })
  deviceOptions[deviceType].forEach((dItem)=>{
    if (dItem.children?.length>0) {
      dItem.children.forEach((child: any) => {
        if (child.hasAi) {
          dItem.hasAi = true
        }
      })
    }
  })
  console.log(deviceOptions[deviceType],'东莞港');
}
// 告警点位重叠时，只显示一个，其余隐藏
const showOrHideLabelCommonFun = ({
  x,
  y,
  z,
  alertMessageId
}: {
  x: number
  y: number
  z: number
  alertMessageId?: any
}) => {
  const warningMarkList = group.getObjectsByProperty('name', 'warningMark')
  const samePointList = warningMarkList.filter((item: any) => {
    const { x: x2, y: y2, z: z2 } = item.position
    return x === x2 && y === y2 && z === z2
  })
  for (let i = 0; i < samePointList.length; i++) {
    const isShow =
      alertMessageId == undefined
        ? i === samePointList.length - 1
        : samePointList[i].userData.alertMessageId === alertMessageId
    samePointList[i].visible = isShow
  }
}
const onAlertMessage = (data: any) => {
  if (data.alertGrade === 'INFO') {
    return
  }
  getAlertStatusByLocationCode()
  const aindex = alertList.value.findIndex((item: any) => {
        return item.alertMessageId === data.alertMessageId
  })
  if (aindex>-1) {
      alertList.value[aindex] = Object.assign(
        alertList.value[aindex],
        data
      )
  }else {
    alertList.value.push(data)
  }
  let isHasAlert = false
  for (let key in warnLabelList) {
    if (key == data.alertMessageId) {
      isHasAlert = true

      const index = deviceOptions.warningOptions.findIndex((item: any) => {
        return item.alertMessageId === data.alertMessageId
      })
      if (index > -1) {
        deviceOptions.warningOptions[index] = Object.assign(
          deviceOptions.warningOptions[index],
          data
        )
        const { x, y, z } = deviceOptions.warningOptions[index].position
        showOrHideLabelCommonFun({ x, y, z, alertMessageId: data.alertMessageId })
        const element: any = document.querySelector('#warningMark_' + data.alertMessageId)
        showAlertMessage({ element, index, alertMessageId: data.alertMessageId })
      }
    }
  }
  if (!isHasAlert) {
    let options: any
    switch (data.equipmentType) {
      // case 'DOOR':
      case '门禁设备':
        options = deviceOptions.doorOptions
        break
      // case 'MONITOR':
      case '监控设备':
        options = allMonitorOptions
        break
      default:
        options = []
        break
    }
    options.forEach((dItem: any) => {
      // if (data.equipmentId === dItem.equipmentId) {
      if (dItem.name === data.equipmentName && dItem.location === data.equipmentLocationCode) {
        const newItem = { ...dItem, ...data }
        deviceOptions.warningOptions.push(newItem)
        console.log(deviceOptions.warningOptions,'告警');
        // 添加标签
        nextTick(() => {
          const element: any = document.querySelector('#warningMark_' + newItem.alertMessageId)
          let label = new CSS2DObject(element)
          label.name = 'warningMark'
          label.userData = { alertMessageId: newItem.alertMessageId }
          warnLabelList[newItem.alertMessageId] = label
          const { x, y, z } = newItem.position
          label.position.set(x, y, z)
          group.add(label)
          render()
          // 判断同个点位是否有点，有则隐藏
          showOrHideLabelCommonFun({ x, y, z })
          const index = deviceOptions.warningOptions.length - 1
          showAlertMessage({ element, index, alertMessageId: newItem.alertMessageId })
        })
      }
    })
  }
}
// 显示告警
const showAlertMessage = ({
  element,
  index,
  alertMessageId
}: {
  element: any
  index: number
  alertMessageId: number
}) => {
  setTimeout(() => {
    if (index > -1) {
      // deviceOptions.warningOptions[index].visible = true
      nextTick(() => {
        const translateY = parseInt(
          element.style.transform
            .split(' translate')[1]
            .replace(/\(|\)|px/g, '')
            .split(', ')[1]
        )
        const dialogRefHeight = element.children[1].offsetHeight
        if (translateY - dialogRefHeight > 30) {
          // 向上显示
          element.children[1].style.top = -dialogRefHeight + 'px'
        } else {
          // 向下显示
          element.children[1].style.top = 30 + 'px'
        }
      })
      setTimeout(() => {
        if (warnLabelList[alertMessageId]) {
          // deviceOptions.warningOptions[index].visible = false
        }
      }, 5000)
    }
  }, 200)
}
// 已处理告警，删除告警点位
const onHandleMessage = (data: any) => {
  // 订阅设备告警消息通知 ALERT_MESSAGE
  // 订阅设备告警处理通知 HANDLE_MESSAGE
  getAlertStatusByLocationCode()
  let position = { x: 0, y: 0, z: 0 }
  const index =  alertList.value.findIndex(item=>{
   return  item.alertMessageId === data.alertMessageId
  })
   console.log(index,'删除');
  if (index>-1) {
    alertList.value.splice(index, 1)
    console.log(alertList.value,'删除');
  }
  let mIndex = 0
  const messageIndex = deviceOptions.warningOptions.findIndex((item: any) => {
    if (item.alertMessageId === data.alertMessageId) {
      position = item.position
    }
    return item.alertMessageId === data.alertMessageId
  })
  if (messageIndex > -1) {
    console.log(warnLabelList[data.alertMessageId],'处理前');
    group.remove(warnLabelList[data.alertMessageId])
    delete warnLabelList[data.alertMessageId]
    //过滤掉所有相同的
    deviceOptions.warningOptions.splice(messageIndex, 1)
    console.log(deviceOptions.warningOptions,'处理');
    // 显示隐藏的
    showOrHideLabelCommonFun(position)
    render()
  }
}
// 定义全局变量
let scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  labelRenderer: CSS2DRenderer,
  controls: OrbitControls,
  dracoLoader: DRACOLoader,
  texture: THREE.Texture,
  containerDom: any,
  stats: any,
  selectionBox: any,
  helper: any
// 初始化
const init = () => {
  initScene()
  initCamera()
  initRenderer()
  initLight()
  initControls()
  initContent()
  initSelectionShape()
  // initHelper()
  addEventListener('resize', onWindowResize, false)
  addEventListener('dblclick', onMouseDblclick, false)
}
// 创建场景
const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#14293D')
}
// 创建相机
const initCamera = () => {
  camera = new THREE.PerspectiveCamera(
    50, // 相机视野
    innerWidth / innerHeight, // 水平方向和竖直方向长度的比值
    1, // 近端渲染距离
    3000 // 远端渲染距离
  )
  camera.position.set(0, 310, 628)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
}
// 模型放大缩小
const handleScale = (x: number, y: number, z: number, type: string) => {
  // if (group) {
  //   camera.position.set(x, y, z)
  //   // if (type === 'enlarge') {
  //   //   group.position.y = 100
  //   // } else {
  //   //   group.position.y = 0
  //   // }
  //   group.scale.set(1, 1, 1)
  //   group.position.x = 0
  //   group.position.z = 0
  //   group.rotation.set(0, 0, 0)
  //   camera.rotation.set(0, 0, 0)
  //   camera.position.x = 0
  //   camera.position.y = y
  //   render()
  //   controls.update()
  // }
}
// 创建渲染器
const initRenderer = () => {
  containerDom = document.querySelector('#model-container')
  if (containerDom) {
    // 全局渲染器
    // 创建WebGL渲染器，设置抗锯齿为true
    renderer = new THREE.WebGLRenderer({ antialias: true })
    // 根据设备像素比设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    // 设置渲染器的大小
    renderer.setSize(innerWidth, innerHeight)
    // 设置渲染器的输出编码
    renderer.outputEncoding = THREE.sRGBEncoding
    // 设置渲染器的色调映射方式
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // 设置渲染器的色调映射曝光度
    renderer.toneMappingExposure = 1
    // 启用阴影映射
    renderer.shadowMap.enabled = true
    // 设置阴影映射类型为VSMShadowMap
    renderer.shadowMap.type = THREE.VSMShadowMap
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // 将渲染器的DOM元素添加到容器中
    containerDom.appendChild(renderer.domElement)
    // 创建标签渲染器
    labelRenderer = new CSS2DRenderer()
    // 设置标签渲染器的大小
    labelRenderer.setSize(innerWidth, innerHeight)
    // 设置标签渲染器的DOM元素样式
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0px'
    labelRenderer.domElement.style.left = '0px'
    labelRenderer.domElement.style.pointerEvents = 'none'
    labelRenderer.domElement.id = 'labelRenderer'
    // 将标签渲染器的DOM元素添加到容器中
    containerDom.appendChild(labelRenderer.domElement)
  }
}
// 创建光源
const initLight = () => {
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  // scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(260, 200, 400)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.left = -500
  directionalLight.shadow.camera.right = 500
  directionalLight.shadow.camera.top = 360
  directionalLight.shadow.camera.bottom = -360
  directionalLight.shadow.camera.near = 5
  directionalLight.shadow.camera.far = 1200
  directionalLight.shadow.bias = -0.00005
  directionalLight.shadow.mapSize.set(1024, 1024)
  // 查看平行光阴影相机属性
  scene.add(directionalLight)
}
// 创建相机控制器
const initControls = () => {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0
  controls.maxDistance = 860
  controls.maxPolarAngle = Math.PI / 2 - 0.1
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE
  }
  controls.target.x = 0
  controls.target.y = -48
  controls.target.z = 28
  controls.update()
  controls.addEventListener('change', render)
  // controls.enabled = false
  // controls.addEventListener('change', () => {
  //   console.log(camera, controls, camera.position, controls.target, controls.getDistance())
  //   // controls.update()
  // })
  // 设置阻尼
  // controls.enableDamping = true
  // controls.dampingFactor = 0.2
}
watch(
  () => props.useSelect,
  val => {
    if (controls) {
      controls.enabled = !val
      controls.update()
    }
    labelRenderer.domElement.className = val ? 'pointer-events-none' : ''
  }
)
const isMove = ref(false)
const initSelectionShape = () => {
  // 创建画框box
  selectionBox = new SelectionBox(camera, scene)
  helper = new SelectionHelper(renderer, 'selectBox')
  // 监听鼠标事件画框
  containerDom.addEventListener('mousedown', onMouseDown)
  containerDom.addEventListener('mousemove', onMouseMove)
  containerDom.addEventListener('mouseup', onMouseUp)
}
const getVector3Point = ({ x, y }: { x: number; y: number }) => {
  // 创建一个射线投射器
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  // 计算射线与场景中的物体的交点
  const intersects = raycaster.intersectObjects(scene.children, true)
  if (intersects.length > 0) {
    return intersects[0].point
  }
}
// 动画
let tweenAnimationFrame: any = null
// 动态调整相机位置
const handlePosition = (boxMin: any, boxMax: any) => {
  let box3 = new THREE.Box3()
  // box3.expandByObject(obj) // 计算模型包围盒
  box3.set(boxMin, boxMax) // 设置盒模型
  let size = new THREE.Vector3()
  box3.getSize(size) // 计算包围盒尺寸
  let center = new THREE.Vector3()
  box3.getCenter(center) // 计算一个层级模型对应包围盒的几何体中心坐标
  // const box3Helper = new THREE.Box3Helper(box3, 0xffff00)
  // scene.add(box3Helper)
  let max = Math.max(...Object.values(size))
  let min = Math.min(size.x, size.z)
  // console.log('max', max)
  // console.log('center.clone().addScalar(max)', center.clone().addScalar(max))
  // console.log('center', center)
  animateCamera(camera.position, controls.target, center.clone().addScalar(min), center, () => {
    cancelAnimationFrame(tweenAnimationFrame)
    controls.maxDistance = 860 + Math.abs(center.x)
    labelRenderer.domElement.className = ''
  })
}
// oldP  相机原来的位置
// oldT  target原来的位置
// newP  相机新的位置
// newT  target新的位置
// callBack  动画结束时的回调函数
function animateCamera(oldP: any, oldT: any, newP: any, newT: any, callBack: Function) {
  updateTWEEN()
  var tween = new TWEEN.Tween({
    x1: oldP.x, // 相机x
    y1: oldP.y, // 相机y
    z1: oldP.z, // 相机z
    x2: oldT.x, // 控制点的中心点x
    y2: oldT.y, // 控制点的中心点y
    z2: oldT.z // 控制点的中心点z
  })
  tween.to(
    {
      x1: newP.x,
      y1: newP.y,
      z1: newP.z,
      x2: newT.x,
      y2: newT.y,
      z2: newT.z
    },
    1000
  )
  tween.onUpdate(function (object) {
    camera.position.x = object.x1
    camera.position.y = object.y1
    camera.position.z = object.z1
    controls.target.x = object.x2
    controls.target.y = object.y2
    controls.target.z = object.z2
    controls.update()
    // camera.near = max * 0.1 //最好和相机位置或者说包围盒关联，别设置0.1 1之类看似小的值
    // camera.far = max * 400 //根据相机位置和包围大小设置，把包围盒包含进去即可，宁可把偏大，不可偏小
    camera.updateProjectionMatrix()
    render()
  })
  tween.onComplete(function () {
    // controls.enabled = true
    emit('changeUseSelect', false)
    callBack && callBack()
  })
  tween.easing(TWEEN.Easing.Cubic.InOut)
  tween.start()
}
const updateTWEEN = () => {
  tweenAnimationFrame = requestAnimationFrame(updateTWEEN)
  TWEEN.update()
}
const midpoint = ([x1, y1]: [x1: number, y1: number], [x2, y2]: [x2: number, y2: number]) => {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
}
function onMouseDown(event: any) {
  if (props.useSelect) {
    isMove.value = false
    selectionBox.startPoint.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    )
  }
}
function onMouseMove(event: any) {
  if (helper.isDown && props.useSelect) {
    isMove.value = true
    selectionBox.endPoint.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    )
  } else if (!props.useSelect) {
    if (document.querySelector('.selectBox')) {
      document.querySelector('.selectBox').style.display = 'none'
    }
  }
}
function onMouseUp(event: any) {
  if (props.useSelect && isMove.value) {
    isMove.value = false
    selectionBox.endPoint.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    )
    const startPoint = {
      x: (helper.pointTopLeft.x / window.innerWidth) * 2 - 1,
      y: -(helper.pointTopLeft.y / window.innerHeight) * 2 + 1
    }
    const endPoint = {
      x: (helper.pointBottomRight.x / window.innerWidth) * 2 - 1,
      y: -(helper.pointBottomRight.y / window.innerHeight) * 2 + 1
    }
    const centerPoint = midpoint([startPoint.x, startPoint.y], [endPoint.x, endPoint.y])
    // 将物体的中心点移动到鼠标点击点的位置
    const targetPosition: any = getVector3Point(new THREE.Vector2(centerPoint.x, centerPoint.y))
    const start: any = getVector3Point(startPoint)
    const end: any = getVector3Point(endPoint)
    const offset = new THREE.Vector3().subVectors(targetPosition, group.position)
    handlePosition(
      { x: Math.min(start.x, end.x), y: 0, z: Math.min(start.z, end.z) },
      { x: Math.max(start.x, end.x), y: 20, z: Math.max(start.z, end.z) }
    )
  }
}
// 复原
const recovery = () => {
  camera.position.set(0, 310, 628)
  controls.target.x = 0
  controls.target.y = -48
  controls.target.z = 28
  controls.update()
  camera.updateProjectionMatrix()
  render()
  // animateCamera(camera.position, controls.target, { X: 0, y: 310, z: 628 }, { x: 0, y: -48, z: 28 })
}
const dashboardStore = useDashboardStore()
// 加载场景内容
const initContent = () => {
  const baseUrl = '/model-statics'
  // 加载天空hdr贴图
  const texLoader = new RGBELoader()
  if (dashboardStore.texture) {
    texture = dashboardStore.texture
  } else {
    texLoader.loadAsync(baseUrl + '/pure-sky.hdr').then((tex: THREE.Texture) => {
      // 如何将图像应用到对象
      tex.mapping = THREE.EquirectangularReflectionMapping
      texture = tex
      dashboardStore.setTexture(markRaw(texture))
    })
  }
  // 加载模型
  const loader = new GLTFLoader()
  //设置解压库文件路径
  dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath(baseUrl + '/draco/')
  loader.setDRACOLoader(dracoLoader)
  if (dashboardStore.gltdGroup) {
    showProgress.value = false
    group = dashboardStore.gltdGroup
    const allMarkList = [
      ...group.getObjectsByProperty('name', 'warningMark'),
      ...group.getObjectsByProperty('name', 'commonNameMark')
    ]
    for (let i = 0; i < allMarkList.length; i++) {
      group.remove(allMarkList[i])
    }
    loadCommonFun()
  } else {
    loader.load(
      baseUrl + '/port-3d.draco.gltf',
      async (gltf: GLTF) => {
        showProgress.value = false
        group = gltf.scene
        group.traverse(function (node: any) {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })
        group.castShadow = true //设置该对象可以产生阴影
        group.receiveShadow = true //设置该对象可以接收阴影
        // group.position.z = -30
        // group.position.x = 50
        // group.rotation.y = -0.4
        // group.position.y = 80
        dashboardStore.setGltdGroup(markRaw(group))
        loadCommonFun()
      },
      (xhr: any) => {
        progress.value = Math.floor((xhr.loaded / xhr.total) * 100)
      }
    )
  }
}
const loadCommonFun = async () => {
  // 将加载的材质texture设置给背景和环境光
  scene.background = texture
  scene.environment = texture
  scene.add(group)
  // await getDoorListFun()
  await getMonitorListFun()
  await getAllMonitorOptions()
  // 添加标签
  loadLabel()
  // 添加模型到场景
  render()
}
// 创建辅助对象
const initHelper = () => {
  // 坐标轴
  scene.add(new THREE.AxesHelper(15))
}
const getUnhandleByCode = async(code:any)=>{
  return (await getUnhandleFlagByCode(code)).data
}
// 加载标签
const loadLabel = () => {
  nextTick(() => {
    setLabelFun('doorOptions', '#doorMark_')
    setLabelFun('monitorOptions', '#monitorMark_')
    // setLabelFun('warningOptions', '#warningMark_', 'alertMessageId')
    getAlertStatusByLocationCode()
    markOption.data.forEach(item => {
      const label = new CSS2DObject(document.querySelector('#' + item.id) as HTMLElement)
      const { x, y, z } = item.position
      label.position.set(x, y, z)
      label.name = 'commonNameMark'
      Object.assign(item,{isAlert:false})
      group.add(label)
      render()
    })
    console.log(markOption.data,'regionMarkList');
  })
}
// 获取区域告警情况
const getAlertStatusByLocationCode = async()=>{
  let promiseList = []
  console.log(markOption.data);
  markOption.data&&markOption.data.forEach((item)=>{
    promiseList.push(getUnhandleFlagByCode(item.orientation))
  })
  let res =  await Promise.all(promiseList)
  res.forEach((item,index)=>{
    Object.assign(markOption.data[index],{isAlert:item.data})
  })
  console.log(markOption.data,'markData');
}
// 添加不同类型标签
const setLabelFun = (deviceType: string, key: string, idName?: string) => {
  nextTick(() => {
    deviceOptions[deviceType].forEach((item: any, index: number) => {
      // 添加标签
      let label = new CSS2DObject(
        document.querySelector(key + (idName ? item[idName] : index)) as HTMLElement
      )
      const { x, y, z } = item.position
      if (deviceType === 'warningOptions') {
        label.name = 'warningMark'
        label.userData = { alertMessageId: item.alertMessageId }
        warnLabelList[item.alertMessageId] = label
      }
      label.position.set(x, y, z)
      label.name = 'commonNameMark'
      group.add(label)
      render()
      if (deviceType === 'warningOptions') {
        showOrHideLabelCommonFun({ x, y, z })
      }
    })
  })
}
// // 创建一个时钟对象Clock
// var clock = new THREE.Clock()
// // 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
// var FPS = 45
// var renderT = 1 / FPS //单位秒  间隔多长时间渲染渲染一次
// // 声明一个变量表示render()函数被多次调用累积时间
// // 如果执行一次renderer.render，timeS重新置0
// var timeS = 0
// 渲染函数
const render = () => {
  if (renderer) {
    // console.log('render')
    // 执行渲染
    labelRenderer.render(scene, camera)
    renderer.render(scene, camera)
    // requestAnimationFrame(render)
    // //.getDelta()方法获得两帧的时间间隔
    // var T = clock.getDelta()
    // timeS = timeS + T
    // // requestAnimationFrame默认调用render函数60次，通过时间判断，降低renderer.render执行频率
    // // if (timeS > renderT) {
    // // 控制台查看渲染器渲染方法的调用周期，也就是间隔时间是多少
    // console.log(`调用.render时间间隔`, timeS * 1000 + '毫秒')
    // // controls.update()
    // // 执行渲染
    // labelRenderer.render(scene, camera)
    // renderer.render(scene, camera)
    // //renderer.render每执行一次，timeS置0
    // timeS = 0
    // }
  }
}
// 窗口变动自适应方法
const onWindowResize = () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  labelRenderer.setSize(innerWidth, innerHeight)
  renderer.setSize(innerWidth, innerHeight)
  render()
}
// 鼠标双击触发的方法
function onMouseDblclick(event: any) {
  // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
  const intersects = getIntersects(event)
  // 获取选中最近的 Mesh 对象
  if (intersects.length != 0 && intersects[0].object instanceof THREE.Mesh) {
    const selectObject = intersects[0].object
    console.log(intersects[0].point)
  } else {
    console.log('未选中 Mesh!')
  }
}
// 获取与射线相交的对象数组
function getIntersects(event: any) {
  event.preventDefault()
  // 声明 raycaster 和 mouse 变量
  let raycaster = new THREE.Raycaster()
  let mouse = new THREE.Vector2()
  // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
  raycaster.setFromCamera(mouse, camera)
  // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
  let intersects = raycaster.intersectObjects(scene.children)
  // console.log('intersects', intersects)
  //返回选中的对象
  return intersects
}
const onLabelClick = (orientation: string) => {
  emit('changeIndoor', { orientationData: orientation, type: 'indoor' })
}
// 初始化所有点位弹窗都不可见
const hideAllMarkDialog = () => {
  for (let key in deviceOptions) {
    deviceOptions[key].map((item: any) => {
      item.show = false
      item.showpop = false
      return item
    })
  }
}
const isRowReverse = ref(false)
const handleClick = (e: any, key: string, id: string, index: number) => {
  const show = !deviceOptions[key][index].show // 先保存要定义的数据
  // 其它点位全部初始化为false
  hideAllMarkDialog()
  deviceOptions[key][index].show = show
  if (deviceOptions[key][index].show) {
    nextTick(() => {
      //鼠标移入
      const element: any = document.querySelector('#' + id)
      if (key === 'monitorOptions') {
        markRef.value[id].initCloudConsoleDialog()
        // e.clientX 鼠标位置 e.offsetX鼠标距离元素左部的位置
        // let x = e.clientX - e.offsetX
        element.children[1].style.top = '0'
        if (window.innerWidth - e.clientX > e.clientX) {
          isRowReverse.value = false
          element.children[1].style.left = '-264px'
          element.children[1].style.transform = 'translateY(calc(-50% - -18px))'
        } else {
          isRowReverse.value = true
          element.children[1].style.left = '-504px'
          element.children[1].style.transform = 'translateY(calc(-50% - -18px))'
        }
      } else {
        // e.clientY 鼠标位置 e.offsetY鼠标距离元素顶部的位置 20为边距
        let y = e.clientY - e.offsetY - 20
        // console.log(element.children[1])
        var dialogRefHeight = element.children[1].offsetHeight
        // console.log('点的顶部位置距离浏览器高度', y)
        // console.log('弹窗高度', dialogRefHeight)
        if (y - dialogRefHeight > 30) {
          // 向上显示
          element.children[1].style.top = -dialogRefHeight + 'px'
        } else {
          // 向下显示
          element.children[1].style.top = 30 + 'px'
        }
      }
    })
  }
}
const handleMouse=(e: any, key: string, id: string, index: number) => {
  console.log(321456,deviceOptions[key][index]);
  if (deviceOptions[key][index].show) {
    return
  }
  // 先保存要定义的数据
  let children = deviceOptions[key][index].children
  // 遍历查找是否存在一个子集的hasAi属性为true
  let hasAi = false
  for (let i = 0; i < children.length; i++) {
    if (children[i].hasAi) {
      // 存在一个子集的hasAi属性为true
      // 则将其子集的show属性设置为true
      hasAi = true
      console.log(deviceOptions,'123');
    }
  }
  if (!hasAi) {
    return
  }
  // 其它点位全部初始化为false
  // hideAllMarkDialog()
  deviceOptions[key][index].showpop = true
  if (deviceOptions[key][index].showpop) {
    nextTick(() => {
      //鼠标移入
      const element: any = document.querySelector('#' + id)
      // if (key === 'monitorOptions') {
      //   // markRef.value[id].initCloudConsoleDialog()
      //   // e.clientX 鼠标位置 e.offsetX鼠标距离元素左部的位置
      //   // let x = e.clientX - e.offsetX
      //   element.children[1].style.top = '0'
      //   if (window.innerWidth - e.clientX > e.clientX) {
      //     isRowReverse.value = false
      //     element.children[1].style.left = '-264px'
      //     element.children[1].style.transform = 'translateY(calc(-50% - -18px))'
      //   } else {
      //     isRowReverse.value = true
      //     element.children[1].style.left = '-504px'
      //     element.children[1].style.transform = 'translateY(calc(-50% - -18px))'
      //   }
      // } else {
      //   // e.clientY 鼠标位置 e.offsetY鼠标距离元素顶部的位置 20为边距
      //   let y = e.clientY - e.offsetY - 20
      //   // console.log(element.children[1])
      //   var dialogRefHeight = element.children[1].offsetHeight
      //   // console.log('点的顶部位置距离浏览器高度', y)
      //   // console.log('弹窗高度', dialogRefHeight)
      //   if (y - dialogRefHeight > 30) {
      //     // 向上显示
      //     element.children[1].style.top = -dialogRefHeight + 'px'
      //   } else {
      //     // 向下显示
      //     element.children[1].style.top = 30 + 'px'
      //   }
      // }
    })
  }
}
const handleMouseLeave=(e: any, key: string, id: string, index: number) => {
  console.log(321456,e);
   deviceOptions[key][index].showpop = false
  // if (e.toElement == alMessageDetail.value) {
  //   console.log(e);
  //   return;
  // } else {
  //   if (deviceOptions[key][index].showpop) {
  //     deviceOptions[key][index].showpop = false
  //   }
  // }
  // const showpop = !deviceOptions[key][index].showpop // 先保存要定义的数据
  // // 其它点位全部初始化为false
  // // hideAllMarkDialog()
  // deviceOptions[key][index].showpop = true
}
const markRef = ref<any>({})
const getMarkRef = (el: any, id: string) => {
  markRef.value[id] = el
}
onUnmounted(() => {
  removeEventListener('resize', onWindowResize, false)
  removeEventListener('dblclick', onMouseDblclick, false)
  scene.clear()
  renderer.dispose()
  renderer.forceContextLoss()
  renderer = null
  dracoLoader.dispose()
  dracoLoader = null
  controls.dispose()
  controls = null
  // 移除事件订阅
  emits.off('ALERT_MESSAGE', onAlertMessage)
  emits.off('HANDLE_MESSAGE', onHandleMessage)
  // 移除模型鼠标监听事件
  containerDom.removeEventListener('mousedown', onMouseDown)
  containerDom.removeEventListener('mousemove', onMouseMove)
  containerDom.removeEventListener('mouseup', onMouseUp)
})
defineExpose({
  loadLabel,
  // refreshAlertMessage,
  handleScale,
  recovery
})
const requireImgUrl = (name: string) => {
  return new URL(`../../assets/images/dashboard-dg/${name}.png`, import.meta.url).href
}
const selectAlertByCode = (item)=>{
  if (!item) {
    return
  }

  let list = []
  alertList.value.forEach((alert)=>{
    if (alert&&alert.equipmentLocationCode==item.equipmentLocationCode) {
      console.log(alert);
      list.push(alert)
    }
  })
  return list
}
</script>
<template>
  <div
    id="model-container"
    :class="{ crosshair: useSelect }"
    @click.stop="hideAllMarkDialog"
    @contextmenu="(event) => (event.returnValue = false)"
  >
    <!-- 模型加载进度 -->
    <el-progress
      v-if="showProgress"
      :show-text="false"
      :percentage="progress"
    />
    <!-- 标签 -->
    <div
      v-for="item in markOption.data"
      v-show="false"
      :id="item.id"
      :key="item.id"
      class="label label-text"
    >
      <!-- <img
        style="cursor: pointer;"
        :src="requireImgUrl('区域标签')"
        @click.stop="onLabelClick(item.orientation)"
      /> -->
      <div
        :class="item.isAlert ? 'alert-box' : 'label-box'"
        :style="item.style"
        @dblclick.stop="onLabelClick(item.orientation)"
      >
        <img
          :src="
            item.isAlert ? requireImgUrl('alertRoute') : requireImgUrl('route')
          "
          alt=""
          class="route"
        />
        <div class="label-name">
          {{ item.name }}
        </div>
      </div>
      <!-- {{ item.orientation }}
      <el-icon><Right /></el-icon> -->
    </div>
    <!-- 监控点位 -->
    <ponitMark
      v-for="(item, index) in deviceOptions.monitorOptions"
      v-show="false"
      :id="'monitorMark_' + index"
      :key="index"
      :ref="(el) => getMarkRef(el, 'monitorMark_' + index)"
      type="MONITOR"
      :icon="item.hasAi ? 'eqAi' : 'device-icon_3'"
      :mark-options-data="item"
      :class="{ 'row-reverse': isRowReverse }"
      @mousemove.stop="
        handleMouse($event, 'monitorOptions', 'monitorMark_' + index, index)
      "
      @mouseleave.stop="
        handleMouseLeave(
          $event,
          'monitorOptions',
          'monitorMark_' + index,
          index
        )
      "
      @click.stop="
        handleClick($event, 'monitorOptions', 'monitorMark_' + index, index)
      "
    />
    <ponitMark
      v-for="(item, index) in deviceOptions.warningOptions"
      v-show="false"
      :id="'warningMark_' + item.alertMessageId"
      :key="item.alertMessageId"
      :alertList="alertList"
      warning
      :mark-options-data="item"
      :icon="item.equipmentType === '门禁设备' ? 'device-icon_1' : 'alerteq'"
      @on-label-click="onLabelClick"
      @click.stop="
        handleClick(
          $event,
          'warningOptions',
          'warningMark_' + item.alertMessageId,
          index
        )
      "
    />
  </div>
</template>
<style scoped lang="scss">
#model-container {
  width: 100%;
  height: 100%;
  position: relative;
  left: 0;
  top: 0;
  .label {
    position: relative;
    pointer-events: auto;
    &-text {
      padding: 4px 6px;
      // background-color: rgba(8, 17, 63, 0.6);
      font-size: 12px;
      border-radius: 4px;
    }
    img {
      width: 100%;
    }
    // 每两秒自动旋转
    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .label-box {
      position: relative;
      font-size: clamp(1.063rem, 0.89vw, 2.125rem);
      width: 90px;
      color: #bdebff;
      height: 90px;
      background: url("../../assets/images/dashboard-dg/区域标签.png") center
        no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
      background-size: 100% 100%;
      cursor: pointer;
      // background: #000;
      .route {
        position: absolute;
        transform: translate(-50%, -50%);
        animation: rotate 2s linear infinite;
      }
      .label-name {
        font-weight: bold;
      }
    }
    .alert-box {
      position: relative;
      font-size: clamp(1.063rem, 0.89vw, 2.125rem);
      width: 90px;
      color: #ffd7d5;
      height: 90px;
      background: url("../../assets/images/dashboard-dg/告警标签.png") center
        no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
      background-size: 100% 100%;
      cursor: pointer;
      .route {
        position: absolute;
        transform: translate(-50%, -50%);
        animation: rotate 2s linear infinite;
      }
      .label-name {
        font-weight: bold;
      }
    }
  }
  :deep(.el-progress) {
    position: fixed;
    z-index: 10;
    width: 280px;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    .el-progress-bar__outer {
      height: 8px !important;
    }
  }
}
.row-reverse {
  ::v-deep(.monitor-wrap) {
    flex-direction: row-reverse;
  }
}
.crosshair {
  cursor: crosshair;
}
</style>
<style lang="scss">
.selectBox {
  border: 1px solid #55aaff;
  background-color: rgba(75, 160, 255, 0.3);
  position: fixed;
  z-index: 9999;
}
.pointer-events-none {
  div {
    pointer-events: none !important;
  }
}
</style>

```