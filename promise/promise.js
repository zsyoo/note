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
  then(onFulfilled,onRejected) {
    // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // onRejected如果不是函数，就忽略onRejected，直接扔出错误
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
    // then的链式调用，所以需要返回promise
    let promise2 = new MyPromise((resolve,reject) => {
      if(this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            // then的执行结果，传递给resolve(value)
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if(this.state === 'pedding') {
        // 当状态还未改变，例如请求还没返回值或者有定时器，此时状态为pedding
        // 我们把成功后的回调存储起来，当状态改变时，再去调用成功的回调
        // 由于Promise的一个实例可以多次.then，所以用数组存储
        // onFulfilled传入到成功数组
        this.onResolvedCallbacks.push(()=>{
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        // onRejected传入到失败数组
        this.onRejectedCallbacks.push(()=>{
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return p2
  }
  // 如果是上一步失败 let x = rejectFn(this.reason)
  // 但是经过失败处理函数x=2,那么经过resolvePromise的处理也是走resolve
  // 其实这个函数主要是用来转换成promise的，如果成功就走resolve，转换过程中有错误，就走reject
  // 也就是说上层promise状态为失败，走then失败回调，不影响下层继续走成功的回调
  resolvePromise(promise2, x, resolve,reject) {
    // 循环引用报错
    if(promise2 === x) {
      reject()
    }
    // 失败成功的方法都传入，为了保证只调用其中的一个方法
    let called
    if(x!=null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        let then = x.then
        if(typeof then === 'function') {
          // 为什么不用x.then()呢？
          then.call(x, y => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            // resolve的结果依旧是promise 那就继续解析
            resolvePromise(promise2, y, resolve, reject);
          }, err => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            reject(err);// 失败了就失败了
          })
        } else {
          resolve(x)
        }
      } catch {
        // 也属于失败
        if (called) return;
        called = true;
        // 取then出错了那就不要在继续执行了
        reject(e)
      }
    } else {
      resolve(x)
    }
  }
}