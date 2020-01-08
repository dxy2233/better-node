import * as shell from 'shelljs'
import * as path from 'path'
import * as fs from 'fs'

const dir1 = 'd:/october/' // 工作地址
const dir2 = 'd:/three-power/code/' // svn地址

let cp = {
  // 验证路径
  testAdress: (adress1: string = dir1, adress2: string = dir2) => {
    try {
      fs.accessSync(adress1, fs.constants.R_OK | fs.constants.W_OK)
      fs.accessSync(adress2, fs.constants.R_OK | fs.constants.W_OK)
      return true
    } catch (error) {
      console.log('地址不正确')
      return false
    }
  },
  // 拷贝文件
  dir1ToDir2: (adress1: string = dir1, adress2: string = dir2) => {
    shell.cd(adress2)
    shell.cd('..')
    shell.echo('更新svn：' + path.resolve('./'))
    // svn更新,有冲突停止
    shell.exec('svn update')
    if (shell.exec('svn status|grep ^C').length !== 0) return
    // 删除工作目录文件
    shell.cd(adress1)
    console.log('进入工作目录：' + path.resolve('./'))
    console.log('清除文件准备同步')
    shell.ls('-A').forEach(item => {
      if (item === 'node_modules' || item === '.git') return
      shell.rm('-R', item)
    })
    // 拷贝文件
    shell.cd(adress2)
    console.log('源文件目录：' + path.resolve('./'))
    console.log('拷贝文件')
    shell.ls('-A').forEach(item => {
      if (item === 'node_modules') return
      shell.cp('-R', item, adress1)
    })
  },
  run: () => {
    if (!cp.testAdress()) return
    cp.dir1ToDir2()
  }
}
cp.run()
