/*
 * @Description:
 * @Author: xj
 * @Date: 2022-01-07 16:07:21
 * @LastEditTime: 2022-01-07 18:18:18
 * @LastEditors: xj
 */

export class GetRecorderManager {
  constructor(canvas) {
    this.canvas = canvas
    this.waveCanvasContext = canvas.getContext('2d')
    this.onSuccessCallback = null
    this.onErrorCallback = null
    this.recorderState = 'sleep'
    this.mediaRecorder = null
    this.chunks = []
    this.stream = null
    this.audioCtx = null
  }

  ondataavailable() {}
  onStart() {}
  onStop() {}
  onError() {}
  onSuccess() {}

  start() {
    let constraints = {audio: true}
    window.navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream
        this.recorderState = 'record'

        this.mediaRecorder = new MediaRecorder(this.stream)

        this.mediaRecorder.ondataavailable = (event) => {
          this.chunks.push(event.data)
        }
        this.mediaRecorder.onstart = (event) => {
          this.onStart(event)
          this.visualize(this.stream)
        }
        this.mediaRecorder.onstop = (event) => {
          this.recorderState = 'sleep'

          let blob = new Blob(this.chunks, {
            type: 'audio/webm'
          })

          const blobURL = URL.createObjectURL(blob)
          const file = this.generateFile(blob)
          this.stream.getTracks()[0].stop()
          this.onStop({file, blobURL})
        }

        this.mediaRecorder.start(10)
      }, (error) => {
        this.onError({status: false, message: error})
      })


  }
  stop() {
    this.mediaRecorder.stop()
  }
  /**
   * @description: 生成文件
   * @return {Object} File
   * @param {Blob} blob
   */
  generateFile(blob) {
    const file = new File([blob], 'audio.mp3', {
      type: 'audio/mp3'
    })
    return file
  }
  /**
   * @description: 授权当前用户麦克风权限
   * @param  {*}
   * @return {*}
   */
  getUserMediaPermission() {
    if (window.navigator.mediaDevices.getUserMedia) {
      let constraints = {audio: true}
      window.navigator.mediaDevices.getUserMedia(constraints)
        .then(
          (stream) => (this.resolve(stream), this.onSuccess({status: true})),
          (error) => (this.reject(error), this.onError({status: false, message: error}))
        );
    } else {
      this.onError({status: false, message: '您的浏览器暂不支持音频录制, 请使用 Chrome 浏览器，完成更好的体验'})
    }
  }
  /**
   * @description: 授权成功
   * @param  {*}
   * @return {*}
   * @param {Object} stream 流
   */
  resolve(stream) {
    console.log('stream', stream);
    stream.getTracks()[0].stop()
  }
  /**
   * @description: 授权失败
   * @param  {*}
   * @return {*}
   * @param {Object} error 错误信息
   */
  reject(error) {
    console.error(error);
  }
  /**
   * @description: 清除画布
   * @param  {*}
   * @return {*}
   */
  closeVisualize() {
    this.waveCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  /**
   * @description: 绘制可视化效果
   * @param  {*}
   * @return {*}
   * @param {Object} stream 流
   */
  visualize(stream) {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    const source = this.audioCtx.createMediaStreamSource(stream);

    const analyser = this.audioCtx.createAnalyser();

    console.log('analyser', analyser);
    console.log('source', source);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    const WIDTH = this.canvas.width
    const HEIGHT = this.canvas.height;
    this.waveCanvasContext.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = () => {

      if (this.recorderState == 'record') {
        requestAnimationFrame(draw);
      } else {
        this.closeVisualize()
        return
      }

      analyser.getByteTimeDomainData(dataArray);

      let x = 0;
      this.waveCanvasContext.fillStyle = 'rgb(0, 0, 0)';
      this.waveCanvasContext.fillRect(0, 0, WIDTH, HEIGHT);

      let barWidth = (WIDTH / bufferLength) * 2.5;
      let barHeight;


      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] + 50;

        this.waveCanvasContext.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

        this.waveCanvasContext.fillRect(x, HEIGHT-barHeight/2, barWidth, barHeight/2);

        x += barWidth + 5;
      }
    }
    draw()
  }
}

