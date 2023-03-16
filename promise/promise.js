// 根据 new Promise((resolve,reject) => {})
// 类可以传一个函数,并且function有两个参数，也是函数:(resolve,reject)
class MyPromise {
  // 需要传递一个excutor
  constructor(excutor) {
    // 状态，成功的传参，失败的传参
    this.state = 'pedding'
    this.value = undefined 
    this.reason = undefined
    // 成功存放的数组
    this.onResolvedCallbacks = []
    // 失败存放法数组
    this.onRejectedCallbacks = []
    let resolve = value => {
      if(this.state == 'pedding') {
        this.state = 'fulfilled'
        this.value = value
        // 一旦resolve执行，调用成功数组的函数
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    }
    let reject = reason => {
      if (this.state == 'pedding') {
        this.state = 'rejected'
        this.reason = reason
        // 一旦reject执行，调用失败数组的函数
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    }
    // 当我们在new一个promise的时候，传的函数会立即调用
    // new Promise((resolve) => {...这里会立刻执行，同步任务})
    try {
      // 传递的函数需要有两个参数，而在执行excutor时也就是进行了传参
      // 也就是说在new Promise的时候定义了函数，但是在这里才执行，这是让方法有默认参数方案
      excutor(resolve,reject)
      // resolve的定义在Promise，但是执行在new Promise中，例如：执行resolve(2)，将value传入
    } catch(err) {
      reject(err)
    }
  }
  // .then
  then(resolveFn,rejectFn) {
    if(this.state == 'fulfilled') {
      resolveFn(this.value)
    }
    if (this.state == 'rejected') {
      rejectFn(this.reason)
    }
    if(this.state == 'pedding') {
      // 当状态还未改变，例如请求还没返回值或者有定时器，此时状态为pedding
      // 我们把成功后的回调存储起来，当状态改变时，再去调用成功的回调
      // 由于Promise的一个实例可以多次.then，所以用数组存储
      // onFulfilled传入到成功数组
      this.onResolvedCallbacks.push(()=>{
        onFulfilled(this.value);
      })
      // onRejected传入到失败数组
      this.onRejectedCallbacks.push(()=>{
        onRejected(this.reason);
      })
    }
  }
}