# 描述
该方法用于实现前端音频录制

# 使用

## 下载代码库
> clone https://github.com/xuejiancnode/recorder.git

## 资源导入
> import { GetRecorderManager } from './recorder'

## 实例化
> <canvas class="wave" width="1000" height="200px"></canvas>
> const recorderManager = new GetRecorderManager(document.querySelector('.wave')) // 非必填

## 事件
### onSuccess
用户授权成功触发的事件
#### 参数
result 授权状态

> recorderManager.onSuccess = (result) => {
>   console.log('onSuccess', result);
> }


### onStart
音频开始录制触发的事件
#### 参数
event 开始录制的状态

> recorderManager.onStart = (event) => {
>   console.log('onStart', event);
> }


### onStop
音频结束录制触发的事件
#### 参数
result 生成的文件及BlobURL

> recorderManager.onStop = (result) => {
>   console.log('onStop', result);
> }


### onError
用户授权失败触发的事件
#### 参数
error 失败的状态及描述信息

> recorderManager.onError = (error) => {
>   console.log('onError', error);
> }
