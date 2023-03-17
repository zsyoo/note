let p1 = new Promise((resolve,reject) => {
  reject(1)
})
p1.then(
  value => {
  console.log("成功啦！" + value);
  },
  err => {
    console.log("失败了：" + err);
  }
).then(
  value => {
    console.log("第二个成功的：" + value);
  },
  err => {
    console.log("第二个失败的：" + err);
  }
).catch(err => {
  console.log("catch" + err)
})

let p2 = new Promise((resolve,reject) => {
  reject(1)
})
p2.then(
  value => {
  console.log("成功啦！" + value);
  },
  err => {
    console.log("失败了：" + err);
    return new Promise((resolve,reject) => {
      reject("错误错误")
    })
  }
).catch(err => {
  console.log("catch" + err)
  return 404
}).then(
  value => {
    console.log("catch后的then：" + value);
  }
)