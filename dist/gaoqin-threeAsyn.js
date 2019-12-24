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
const dir1 = 'e:/com.better.synchro1/code'; // svn地址
let cp = {
    // 验证路径
    testAdress: (adress1 = dir1) => {
        try {
            fs.accessSync(adress1, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        }
        catch (error) {
            console.log('地址不正确');
            return false;
        }
    },
    // 打包&&提交svn
    uploadSvn: (adress1 = dir1) => {
        shell.cd(adress1);
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
            to: '708968251@qq.com',
            subject: 'svn更新',
            text: message,
            html: `<div>${message}</div>`
        });
        console.log('Message sent: %s', info.messageId);
    }),
    run: () => {
        if (!cp.testAdress())
            return;
        cp.uploadSvn();
    }
};
cp.run();
