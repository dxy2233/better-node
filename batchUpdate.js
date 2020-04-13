const fs = require('fs')
const shell = require('shelljs')

const adress = [
  'D:/three/base',
  'D:/three/tgj',
  'D:/three/tgj_less',
  'D:/three/yys',
]

// 验证地址
const testAdress = () => {
  try {
    adress.forEach((item) => {
      fs.accessSync(item, fs.constants.R_OK | fs.constants.W_OK)
    })
    return true
  } catch (error) {
    console.log('地址不正确')
    return false
  }
}

// update
const update = () => {
  const arr = []
  adress.forEach((item) => {
    arr.push(
      new Promise((resolve) => {
        shell.cd(item)
        shell.exec('svn update', () => {
          resolve()
        })
      })
    )
  })
  Promise.all(arr).then(() => {
    console.log('update end')
  })
}

const run = () => {
  if (!testAdress()) return
  update()
}

run()
