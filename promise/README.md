# 手写promise
使用ES6中class来手写promise

根据本文进行学习总结：[BAT前端经典面试问题：史上最最最详细的手写Promise教程 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903625769091079)

github笔记地址：[gihub.com](https://github.com/zsyoo/note/tree/main/promise)

## 关于.then执行顺序的说明
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
- new Promise(fn)
- 执行fn()
- 执行resolve()/reject()改变状态
- p.then()执行，判断状态，状态变成了fulfilled
- 输出：resolve成功后执行

这种写法的遇到了一个问题，当这样写的时候，状态没有改变，但是却已经执行到`then`了，那怎么办呢？
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
**小结**:之前一直以为当`resolve/reject`后才能执行`then`,按照这个代码逻辑，其实在`p.then()`的时候，即使状态还没确定，也已经执行`then`了，只不过先将回调函数存储起来，到状态确定的时候才执行，所以更准确的应该说，在状态还未确定时，不执行`then`中的函数，而不是不执行`then`。

## then的链式调用
如何实现链式调用？我们在`then`中返回一个新的`promise`实例，将执行结果作为参数，传到`resolve/reject`中，这样在新的`promise`中我们将判断条件和`resolve(value)/reject(err)`逻辑写好，等着之后`.then`就行了

而由于执行结果的不同，我们要对其进行不一样的处理，我们定义`resolvePromise`进行这一步处理，处理的规则有下面几条
- 若循环引用，则报“循环引用”错误
- `x` 不能是`null`
- `x` 是普通值 直接`resolve(x)`
- `x` 是对象或者函数（包括`promise`），`let then = x.then`
- 如果`then`是个函数，则用`call`执行`then`，第一个参数是`this`，后面是成功的回调和失败的回调
- 如果成功的回调还是`pormise`，就递归继续解析

**总结**：除了执行结果是`promise`对象外，其余结果全部直接返回。我们把`object/function`选出来，然后在里面判断`x.then`是不是函数，如果是的，我们把他当做一个`promise`实例继续解析，如果不是，那就是普通对象，将其直接`resolve`

## catch方法
代码如下
```js
catch(fn){
  return this.then(null,fn);
}
```
catch相当于then失败回调的简写，只能捕捉到上一层的错误，具体的输出可以看这里