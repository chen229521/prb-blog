---
title: 安卓App本地通知
date: 2023-09-07
---

```javascript
import {
    useRouter,
    verifyMoudlePermissions
} from '@/utils/tool';
let myNJS = {
    'aOSNotify': aOSNotify,
    'aOSReceive': aOSReceive,
}
// 获取版本信息
const osVersion = {
    versionNum: () => {
        let SystemVersion = plus.os.version;
        let VersionNumber = Number(SystemVersion.split('.')[0]);
        return VersionNumber;
    }
}
/**  
 * android原生通知发送  
 * @param content 通知内容  
 * @param data json对象，存储通知的隐藏数据，用于点击通知时接收使用  
 */
function aOSNotify(title = '', content = '', data = {}, channelID = '1', notifyID = '1', channelName = '自定义的通知') {
    // #ifdef APP-PLUS  
    // var title = '通知标题';  

    console.log('准备通知');
    console.log(plus.os.name);

    // Android平台下才使用此推送  
    if (plus.os.name != 'Android') {
        return false;
    }

    //随机生成通知ID  
    // var notifyID = notify_ID;
    //先给channel一个默认值


    //传递参数
    if (osVersion.versionNum() >= 8) {
        var payload = {
            'title': title,
            'msg': content,
            'channel_id': channelID,
            'notify_id': notifyID,
            'data': data
        };
    } else {
        var payload = {
            'title': title,
            'msg': content,
            'notify_id': notifyID,
            'data': data
        };
    }

    // 获取应用主Activity实例对象
    var main = plus.android.runtimeMainActivity();
    // importClass: 导入Java类对象
    // 导入上下文（官方翻译）
    var Context = plus.android.importClass("android.content.Context");
    // 导入通知管理相关
    var NotificationManager = plus.android.importClass("android.app.NotificationManager");
    var Notification = plus.android.importClass("android.app.Notification");
    // 
    var Intent = plus.android.importClass("android.content.Intent");
    var PendingIntent = plus.android.importClass("android.app.PendingIntent");
    var nm = main.getSystemService(Context.NOTIFICATION_SERVICE);

    var intent = new Intent(main, main.getClass());
    intent.putExtra("receive", JSON.stringify(payload));

    // PendingIntent.getActivity的第二个参数需要设置为随机数，否则多个通知时会导致前面的通知被后面的通知替换Extra的数据,此处我将其和对应通知的id绑定起来
    var pendingIntent = PendingIntent.getActivity(main, notifyID, intent, PendingIntent.FLAG_CANCEL_CURRENT);

    //可能用到R的一些资源文件
    var r = plus.android.importClass("android.R");

    var mNotification;
    //判断当前系统版本在8.0及以上  
    if (osVersion.versionNum() >= 8) {
        if (nm.getNotificationChannel() == null) {
            var NotificationChannel = plus.android.importClass('android.app.NotificationChannel');
            var channel = new NotificationChannel(channelID, channelName, NotificationManager.IMPORTANCE_HIGH);
            nm.createNotificationChannel(channel);
        }
        mNotification = new Notification.Builder(main, channelID);
        mNotification.setDefaults(Notification.DEFAULT_ALL); // mNotification.setDefaults(~0);
    } else {
        mNotification = new Notification.Builder(main);
        mNotification.setDefaults(Notification.DEFAULT_ALL);
    }
    var i = notifyID.toString();
    mNotification.setVisibility(Notification.VISIBILITY_PUBLIC) //设置可见性
    //mNotification.setOngoing(true)		//设置这是否为“正在进行中”通知
    mNotification.setContentTitle(title) //设置标题  
    mNotification.setContentText(content); //设置内容  
    mNotification.setAutoCancel(true); //设置点击消失  
    mNotification.setShowWhen(true); //显示通知时间，貌似不加这句也能显示   
    mNotification.setSmallIcon(r.drawable.stat_notify_chat);
    // mNotification.setSmallIcon(17301543); //设置app通知小图标,暂只能使用R.drawable文件中的默认值 

    mNotification.setTicker(title); //设置发送到无障碍服务的“ ticker”文本。 
    // mNotification.setDefaults(~0); 		//这两行结合上面的setTicker实现悬浮提示过几秒自动消失，基于覆盖考虑，把这个放到最上方
    mNotification.setPriority(Notification.PRIORITY_HIGH); //通知优先级 

    //mNotification.setFullScreenIntent(pendingIntent, false);   //弹出式提示不消失
    mNotification.setContentIntent(pendingIntent);
    var mNb = mNotification.build();
    console.log(notifyID);

    //判断当前系统版本在8.0及以上    
    if (osVersion.versionNum() >= 8) {
        nm.notify(channelID, notifyID, mNb);
    } else {
        nm.notify(notifyID, mNb);
    }

    //void plus.device.beep(2);//bee bee叫  
    // plus.device.vibrate(300);//震动  

    console.log('通知结束');
    return true;
    // #endif  
}
/**  
 * android原生通知点击后所执行的内容  
 */
function aOSReceive() {
    // #ifdef APP-PLUS  
    if (plus.os.name != 'Android') {
        return false;
    }
    // android原生通知栏接收器（程序退出后无效）  
    var main = plus.android.runtimeMainActivity();
    var intent = main.getIntent();
    var message = intent && intent.getExtra != undefined ? intent.getExtra("receive") : null;
    console.log(message);
    //console.log(typeof(message))
    message = message ? JSON.parse(message) : '';
    // var args = plus.runtime.arguments;
    // console.log(args)
    if (message) {
        //删除当前通知  
        var Context = plus.android.importClass("android.content.Context");
        var nm = main.getSystemService(Context.NOTIFICATION_SERVICE);
        console.log(message.notify_id);
        if (osVersion.versionNum() >= 8) {
            nm.cancel(message.channel_id, message.notify_id); //安卓版本大于等于8的      
        } else {
            nm.cancel(message.notify_id); //安卓版本小于8的  
        }
        // nm.cancelAll();  

        // 把消息数据置空，以免再次打开APP时重复执行此处  
        intent.putExtra("receive", '');

        //用message的数据做点什么
        // uni.showToast({
        // 	title: message.notify_id.toString(),
        // 	position: 'bottom'
        // })
        if (verifyMoudlePermissions('MOBILE_EVENT_CENTER_EVENT_LIST_VIEW')) {
            useRouter(`/pages/incident/pages/incident-detail`, {
                id: message.data.alertMessageId,
                handleStatus: message.data.handleStatus
            })
        } else {
            toast('你的账号无该模块权限，请联系管理员')
        }
    }
    // #endif  
}

export default myNJS

```
