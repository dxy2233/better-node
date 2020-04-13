const fs = require('fs')
const shell = require('shelljs')

const adress = [
  'D:/three/base/code',
  'D:/three/tgj/code',
  'D:/three/tgj_less/code',
  'D:/three/yys/code',
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

// build
const build = () => {
  const arr = []
  adress.forEach((item) => {
    arr.push(
      new Promise((resolve) => {
        shell.cd(item)
        shell.exec('npm run build', () => {
          resolve()
        })
      })
    )
  })
  Promise.all(arr).then(() => {
    console.log('build end')
  })
}

const run = () => {
  if (!testAdress()) return
  build()
}

run()
