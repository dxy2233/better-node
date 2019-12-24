import * as shell from 'shelljs'
import * as path from 'path'
import * as fs from 'fs'
import * as readline from 'readline'
import * as nodemailer from 'nodemailer'

const dir1 = 'd:/october/' // 工作地址
const dir2 = 'd:/com.better.synchro/src/main/resources/code' // svn地址

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
    shell.cd(adress1)
    shell.echo('源文件目录：' + path.resolve('./'))
    shell.echo('开始拷贝')
    shell.ls('-A').forEach(item => {
      if (item === '.git' || item === 'node_modules') return
      shell.cp('-r', item, adress2)
    })
    shell.echo('拷贝结束')
  },
  // 打包&&提交svn
  uploadSvn: (adress1: string = dir1, adress2: string = dir2) => {
    shell.cd(adress2)
    shell.echo('打包目录：' + path.resolve('./'))
    shell.exec('npm run build', () => {
      shell.echo('打包完毕')
      shell.cd('..')
      shell.echo('提交svn目录：' + path.resolve('./'))
      // svn更新
      shell.exec('svn update')
      // 无冲突键入commit后提交
      if (shell.exec('svn status|grep ^C').length === 0) {
        shell.echo('无冲突')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: '请输入commit\n'
        })
        rl.prompt()
        rl.on('line', line => {
          shell.exec('svn add * --force')
          shell.exec(`svn commit -m ${line}`)
          cp.sendEmail(line)
            .then(() => process.exit())
            .catch(console.error)
        })
      } else {
        shell.echo('有冲突!!!')
      }
    })
  },
  // email
  sendEmail: async message => {
    // let testAccount = await nodemailer.createTestAccount()
    // 设置邮箱配置
    let transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 587, // 对应的端口号
      secure: false,
      auth: {
        user: '691369338@qq.com',
        pass: 'xojmmxnhqqwgbcgc'
      }
    })
    // 设置收件人信息
    let info = await transporter.sendMail({
      from: '"三同步svn更新" <dxy5395@qq.com>',
      to: '708968251@qq.com',
      subject: 'svn更新',
      text: message,
      html: `<div>${message}</div>`
    })
    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  },
  run: () => {
    if (!cp.testAdress()) return
    cp.dir1ToDir2()
    cp.uploadSvn()
  }
}
cp.run()
