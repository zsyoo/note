## 手写promise
使用ES6中class来手写promise
根据本文进行学习总结：[]https://juejin.cn/post/6844903625769091079

# 关于.then执行顺序的说明
代码最初是这样的
```js
then(resolveFn,rejectFn) {
  if(this.state == 'fulfilled') {
    resolveFn(this.value)
  }
  if (this.state == 'rejected') {
    rejectFn(this.reason)
  }
}
```
```js
let p = new Promise((resolve,reject) => {
  resolve(2)
})
p.then(function() {
  console.log("resolve成功后执行")
})
```
执行顺序为：
new Promise(fn)
===> 执行fn()
===> 执行resolve()/reject()改变状态
===> p.then()执行，判断状态，状态变成了fulfilled
===> 输出：resolve成功后执行

这种写法的遇到了一个问题，当这样写的时候，状态没有改变，但是却已经执行到.then了，那怎么办呢？
```js
let p = new Promise((resolve,reject) => {
  setTimeout(resolve(2),2000)
})
p.then(function() {
  console.log("resolve成功后执行")
})
```
所以我们得把回调函数先存储起来,等到定时器触发之后，在resolve中去执行
代码大概为
```js
let resolve = value => {
  if (this.state === 'pending') {
    this.state = 'fulfilled';
    this.value = value;
    // 一旦resolve执行，调用成功数组的函数
    this.onResolvedCallbacks.forEach(fn=>fn());
  }
}
......
// then中
// 当状态state为pending时
if (this.state === 'pending') {
  // onFulfilled传入到成功数组
  this.onResolvedCallbacks.push(()=>{
    onFulfilled(this.value);
  })
  // onRejected传入到失败数组
  this.onRejectedCallbacks.push(()=>{
    onRejected(this.reason);
  })
}
```
**总结**:之前一直以为当resolve/reject后才能执行then,按照这个代码逻辑，其实在p.then()的时候，即使状态还没确定，也已经执行then了，只不过先将回调函数存储起来，到状态确定的时候才执行，所以更准确的应该说，在状态还未确定时，不执行then中的函数，而不是不执行then。

