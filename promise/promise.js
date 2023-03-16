// 根据 new Promise((resolve,reject) => {})
// 类可以传一个函数,并且function有两个参数，也是函数:(resolve,reject)
class MyPromise {
  // 需要传递一个excutor
  constructor(excutor) {
    // 状态，成功的传参，失败的传参
    this.state = 'pedding'
    this.value = undefined 
    this.reason = undefined
    let resolve = value => {
      if(this.state == 'pedding') {
        this.state = 'fulfilled'
        this.value = value
      }
    }
    let reject = reason => {
      if (this.state == 'pedding') {
        this.state = 'rejected'
        this.reason = reason
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
}