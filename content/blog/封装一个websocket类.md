---
title: 一个websocket类封装
date: 2023-08-20
---

```javascript

/**
 * 基于原生websocket， 封装socket方法
 *
 */
import { useUserStore } from '../stores/user';
interface ISocket {
  websocket: any
  connectURL: Array<string>
  socketOpen: boolean
  heartbeatTimer: any
  heartbeatInterval: number
  heartbeatCount: number
  heartbeatCurrent: number
  isReconnect: boolean
  reconnectCount: number
  reconnectCurrent: number
  reconnectTimer: any
  reconnectInterval: number
  init: (receiveMessage: Function | null) => any
  receive: (message: any) => void
  heartbeat: () => void
  send: (data: any) => void
  close: () => void
  reconnect: () => void
}
const socket: ISocket = {
  // websocket 实例
  websocket: null,
  // 连接地址
  connectURL: [],
  // 开启标识
  socketOpen: false,
  // 心跳timer
  heartbeatTimer: null,
  // 心跳发送频率
  heartbeatInterval: 30000,
  // 异常跳动次数
  heartbeatCurrent: 0,
  // 允许最多异常跳动次数
  heartbeatCount: 3,
  // 是否自动重连
  isReconnect: true,
  // 重连次数
  reconnectCount: 5,
  // 已发起重连次数
  reconnectCurrent: 0,
  // 重连timer
  reconnectTimer: null,
  // 重连频率
  reconnectInterval: 5000,
  init: (receiveMessage: Function | null) => {
    // 检查当前浏览器是否支持 WebSocket
    if (!('WebSocket' in window)) {
      console.error('浏览器不支持WebSocket')
      return null
    }
    // 已经创建过连接不再重复创建
    // if (socket.websocket) {
    //   return socket.websocket
    // }
    // 连接地址
    var socketUrl = '10.100.50.50:3001'
    let host = location.host
    var a = host.indexOf(":")
    var l = host.substring(0, a);
    console.log(l);
    if (l == '157.122.132.176') {
      socketUrl = ' 157.122.132.176:3001'
    }
    socket.connectURL = [`ws://${location.host}/api/websocket/connect?Authorization=${useUserStore().token
      }`, `ws://10.100.50.67:3001?token=web`]
    socket.websocket = socket.websocket || new WebSocket(socket.connectURL[0])


    // 解说消息
    socket.websocket.onmessage = (e: MessageEvent) => {
      const { data } = e



      // 心跳检测
      if (data === 'pong') {
        socket.heartbeatCurrent = 0
        return
      }
      if (receiveMessage) {
        receiveMessage(data)
      }
    }
    // 连接成功
    socket.websocket.onopen = (e: Event) => {
      socket.socketOpen = true
      socket.isReconnect = true
      // 开启心跳
      socket.heartbeat()
    }
    // 连接发生错误
    socket.websocket.onerror = (e: Event) => {

    }
    // 关闭连接
    socket.websocket.onclose = (e: CloseEvent) => {

      clearInterval(socket.heartbeatInterval)
      socket.socketOpen = false
      socket.websocket = null
      // 需要重新连接
      socket.reconnect()
    }
  },
  send: data => {
    if (socket.websocket && socket.websocket.readyState === socket.websocket.OPEN) {
      // 开启状态直接发送
      socket.websocket.send(data)
    } else {
      // 重置心跳
      clearInterval(socket.heartbeatTimer)
    }
  },
  receive: (message: any) => {
    let params = JSON.parse(JSON.parse(message.data).data)
    return params
  },
  heartbeat: () => {
    // 重置心跳
    if (socket.heartbeatTimer) {
      clearInterval(socket.heartbeatTimer)
    }
    socket.heartbeatTimer = setInterval(() => {
      // 超过允许最多异常跳动次数视为断线, 重新连接
      if (socket.heartbeatCurrent > socket.heartbeatCount) {
        clearInterval(socket.heartbeatTimer)
        socket.heartbeatCurrent = 0
        socket.reconnect()
      } else {
        socket.send("ping")
        socket.heartbeatCurrent++
      }
    }, socket.heartbeatInterval)
  },
  // 关闭连接
  close: () => {
    clearInterval(socket.heartbeatTimer)
    clearTimeout(socket.reconnectTimer)
    socket.isReconnect = false
    socket.websocket && socket.websocket.close()
  },
  // 重新连接
  reconnect: () => {
    if (socket.isReconnect) {
      socket.reconnectTimer = setTimeout(() => {
        // 超过重连次数
        if (socket.reconnectCurrent >= socket.reconnectCount) {
          clearTimeout(socket.reconnectTimer)
          socket.isReconnect = false
          return
        }
        // 记录重连次数
        socket.reconnectCurrent++
        if (!socket.isReconnect) {
          socket.close()
        } else {
          socket.init(null)
        }
      }, socket.reconnectInterval)
    }
  }
}
export default socket


封装为hooks

type socketOptions = {
    websocket: WebSocket
    connectURL: string
    socketOpen: boolean
    heartbeatTimer: any
    heartbeatInterval: number
    heartbeatCount: number
    heartbeatCurrent: number
    isReconnect: boolean
    reconnectCount: number
    reconnectCurrent: number
    reconnectTimer: any
    reconnectInterval: number
}
/**
 * Socket接口
 */
interface ISocket {
    /**
     * 初始化Socket连接
     * @param receiveMessage 接收消息的回调函数或null
     */
    init: (receiveMessage: Function | null) => void
    /**
     * 接收消息
     * @param message 消息对象
     */
    receive: (message: any) => void
    /**
     * 发送数据
     * @param data 发送的数据对象
     */
    send: (data: any) => void
    /**
     * 关闭Socket连接
     */
    close: () => void
    /**
     * 重新连接Socket
     */
    reconnect: () => void
}
const socketDetaultOptions: socketOptions = {
    websocket: null,
    connectURL: '',
    socketOpen: false,
    heartbeatTimer: null,
    heartbeatInterval: 30000,
    heartbeatCurrent: 0,
    heartbeatCount: 3,
    isReconnect: true,
    reconnectCount: 5,
    reconnectCurrent: 0,
    reconnectTimer: null,
    reconnectInterval: 5000
}
/**
 * 使用WebSocket进行通信
 * @param url WebSocket连接的URL
 * @param options WebSocket的配置选项
 * @returns 返回一个包含WebSocket通信方法的对象
 */
const useWebSocket = (url: string, options: socketOptions = socketDetaultOptions): ISocket => {
    let { websocket, connectURL, socketOpen, heartbeatTimer, heartbeatInterval, heartbeatCount, heartbeatCurrent, isReconnect, reconnectCount, reconnectCurrent, reconnectTimer, reconnectInterval } = options
    /**
     * 心跳定时器的回调函数
     */
    const hearbeat = () => {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
        }
        heartbeatTimer = setInterval(() => {
            if (heartbeatCurrent > heartbeatCount) {
                clearInterval(heartbeatTimer)
                heartbeatCurrent = 0
                socket.reconnect()
            } else {
                socket.send('ping')
                heartbeatCurrent++
            }
        }, heartbeatInterval)
    }
    /**
     * WebSocket通信对象
     */
    const socket: ISocket = {
        /**
         * 初始化WebSocket连接
         * @param receiveMessage WebSocket接收消息的回调函数
         */
        init: (receiveMessage: Function | null) => {
            if (!('WebSocket' in window)) {
                throw new Error("浏览器不支持webSocket通信");
            }
            connectURL = url ?? connectURL
            websocket = websocket ?? new WebSocket(connectURL)
            websocket.onmessage = (e: MessageEvent) => {
                const { data } = e
                if (data === 'pong') {
                    heartbeatCurrent = 0
                    return
                }
                if (receiveMessage) {
                    receiveMessage(data)
                }
            }
            websocket.onopen = () => {
                socketOpen = true
                isReconnect = true
                hearbeat()
            }
            websocket.onclose = () => {
                clearInterval(heartbeatInterval)
                socketOpen = false
                websocket = null
                socket.reconnect()
            }
        },
        /**
         * 发送消息
         * @param data 要发送的消息
         */
        send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
            if (websocket && websocket.readyState === websocket.OPEN) {
                websocket.send(data)
            } else {
                clearInterval(heartbeatTimer)
            }
        },
        /**
         * 接收消息
         * @param message WebSocket接收到的消息
         * @returns 返回解析后的消息参数
         */
        receive: (message: any) => {
            let params = JSON.parse(JSON.parse(message.data).data)
            return params
        },
        /**
         * 关闭WebSocket连接
         */
        close: () => {
            clearInterval(heartbeatTimer)
            clearTimeout(reconnectTimer)
            isReconnect = false
            websocket && websocket.close()
        },
        /**
         * 重新连接WebSocket
         */
        reconnect: () => {
            if (isReconnect) {
                reconnectTimer = setTimeout(() => {
                    if (reconnectCurrent >= reconnectCount) {
                        clearTimeout(reconnectTimer)
                        isReconnect = false
                        return
                    }
                    reconnectCurrent++
                    if (!isReconnect) {
                        socket.close()
                    } else {
                        socket.init(null)
                    }
                }, reconnectInterval)
            }
        }
    }
    return socket
}
export default useWebSocket


```