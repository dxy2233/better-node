"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const nodemailer = require("nodemailer");
const dir1 = 'd:/october'; // 工作地址
const dir2 = 'd:/three-province/code'; // svn内code地址
let cp = {
    // 验证路径
    testAdress: (adress1 = dir1, adress2 = dir2) => {
        try {
            fs.accessSync(adress1, fs.constants.R_OK | fs.constants.W_OK);
            fs.accessSync(adress2, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        }
        catch (error) {
            console.log('地址不正确');
            return false;
        }
    },
    // 拷贝文件
    dir1ToDir2: (adress1 = dir1, adress2 = dir2) => {
        // 删除工作目录文件
        shell.cd(adress2);
        console.log('进入工作目录：' + path.resolve('./'));
        console.log('清除文件准备同步');
        shell.ls('-A').forEach(item => {
            if (item === 'node_modules')
                return;
            shell.rm('-R', item);
        });
        // 拷贝文件
        shell.cd(adress1);
        shell.echo('源文件目录：' + path.resolve('./'));
        console.log('拷贝文件');
        shell.ls('-A').forEach(item => {
            if (item === '.git' || item === 'node_modules')
                return;
            shell.cp('-r', item, adress2);
        });
    },
    // 打包&&提交svn
    uploadSvn: (adress1 = dir1, adress2 = dir2) => {
        shell.cd(adress2);
        // 切换到code目录打包后提交
        console.log('打包目录：' + path.resolve('./'));
        shell.exec('npm run build', () => {
            shell.cd('..');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: '请输入commit: '
            });
            rl.prompt();
            rl.on('line', line => {
                // 添加文件
                shell.exec('svn add * --force');
                // 删除文件
                let delData = shell.exec('svn status|grep ^!');
                delData = delData.stdout.split('\r\n');
                delData = delData.filter(item => item);
                delData.forEach(item => {
                    let delUrl = item.slice(1).trim();
                    shell.exec(`svn delete ${delUrl}`);
                });
                // 提交
                shell.exec(`svn commit -m ${line}`);
                // 邮件
                cp.sendEmail(line)
                    .then(() => process.exit())
                    .catch(console.error);
            });
        });
    },
    // email
    sendEmail: (message) => __awaiter(void 0, void 0, void 0, function* () {
        // let testAccount = await nodemailer.createTestAccount()
        // 设置邮箱配置
        let transporter = nodemailer.createTransport({
            host: 'smtp.qq.com',
            port: 587,
            secure: false,
            auth: {
                user: '691369338@qq.com',
                pass: 'xojmmxnhqqwgbcgc'
            }
        });
        // 设置收件人信息
        let info = yield transporter.sendMail({
            from: '"三同步svn更新" <dxy5395@qq.com>',
            to: '708968251@qq.com, 360483222@qq.com',
            subject: '三同步省级项目',
            text: message,
            html: `<div>${message}</div>`
        });
        console.log('Message sent: %s', info.messageId);
    }),
    run: () => {
        if (!cp.testAdress())
            return;
        cp.dir1ToDir2();
        cp.uploadSvn();
    }
};
cp.run();
