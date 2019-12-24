"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const dir1 = 'd:/october/'; // 工作地址
const dir2 = 'd:/com.better.synchro/src/main/resources/code/'; // svn地址
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
        shell.cd(adress2);
        shell.echo('源文件目录：' + path.resolve('./'));
        shell.echo('开始拷贝');
        shell.ls('-A').forEach(item => {
            if (item === 'node_modules')
                return;
            shell.cp('-r', item, adress1);
        });
        shell.echo('拷贝结束');
    },
    run: () => {
        if (!cp.testAdress())
            return;
        cp.dir1ToDir2();
    }
};
cp.run();
