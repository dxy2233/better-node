import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

class Pull {
  gitPath: string;

  svnPath: string;

  constructor(adress1, adress2) {
    this.svnPath = adress1;
    this.gitPath = adress2;
  }

  // 验证路径
  testAdress(): boolean {
    try {
      fs.accessSync(this.gitPath, fs.constants.R_OK | fs.constants.W_OK);
      fs.accessSync(this.svnPath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch (error) {
      console.log('地址不正确');
      return false;
    }
  }

  // 拷贝文件
  dir1ToDir2(): void {
    // 删除工作目录文件
    shell.cd(this.gitPath);
    console.log(`进入工作目录：${path.resolve('./')}`);
    console.log('清除文件准备同步');
    shell.ls('-A').forEach((item) => {
      if (item === 'node_modules' || item === '.git') return;
      shell.rm('-R', item);
    });
    // 拷贝文件
    shell.cd(this.svnPath);
    shell.echo(`源文件目录：${path.resolve('./')}`);
    console.log('拷贝文件');
    shell.ls('-A').forEach((item) => {
      if (item === 'node_modules') return;
      shell.cp('-r', item, this.gitPath);
    });
  }

  run(): void {
    if (!this.testAdress()) return;
    this.dir1ToDir2();
  }
}

const dir1 = 'd:/three/tgj_less/code'; // svn内code地址
const dir2 = 'd:/engin-three/tgj_less'; // 工作地址
const pullbase = new Pull(dir1, dir2);
pullbase.run();
