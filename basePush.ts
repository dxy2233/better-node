import * as shell from 'shelljs'
import * as path from 'path'
import * as fs from 'fs'
// import * as readline from 'readline'
import * as nodemailer from 'nodemailer'

class Push {
  gitPath: string

  svnPath: string

  constructor(adress1, adress2) {
    this.gitPath = adress1
    this.svnPath = adress2
  }

  // 验证路径
  testAdress(): boolean {
    try {
      fs.accessSync(this.gitPath, fs.constants.R_OK | fs.constants.W_OK)
      fs.accessSync(this.svnPath, fs.constants.R_OK | fs.constants.W_OK)
      return true
    } catch (error) {
      console.log('地址不正确')
      return false
    }
  }

  // 拷贝文件
  dir1ToDir2(): void {
    // 删除工作目录文件
    shell.cd(this.svnPath)
    console.log(`进入工作目录：${path.resolve('./')}`)
    console.log('清除文件准备同步')
    shell.ls('-A').forEach((item) => {
      if (item === 'node_modules') return
      shell.rm('-R', item)
    })
    // 拷贝文件
    shell.cd(this.gitPath)
    shell.echo(`源文件目录：${path.resolve('./')}`)
    console.log('拷贝文件')
    shell.ls('-A').forEach((item) => {
      if (item === '.git' || item === 'node_modules') return
      shell.cp('-r', item, this.svnPath)
    })
  }

  // email
  static async sendEmail(): Promise<void> {
    // console.log(this)
    // 设置邮箱配置
    const transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 587, // 对应的端口号
      secure: false,
      auth: {
        user: '691369338@qq.com',
        pass: 'xojmmxnhqqwgbcgc',
      },
    })
    // 设置收件人信息
    const info = await transporter.sendMail({
      from: '"svn更新<三同步-base>" <dxy5395@qq.com>',
      to: '708968251@qq.com, 360483222@qq.com',
      subject: '三同步base',
      text: '三同步base',
      html: `<div>三同步base</div>`,
    })
    console.log('Message sent: %s', info)
  }

  run(): void {
    if (!this.testAdress()) return
    this.dir1ToDir2()
    Push.sendEmail()
  }
}

const dir1 = 'd:/engin-three/base' // 工作地址
const dir2 = 'd:/three/base/code' // svn内code地址
const pushbase = new Push(dir1, dir2)
pushbase.run()
