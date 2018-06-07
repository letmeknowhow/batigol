'use strict';

//  创建新工程

const path = require('path');
const fs = require('fs');
const download = require('download-git-repo');
const utils = require('./utils');

function createApp(args) {
  const prjName = args.name;
  if (!prjName) {
    console.log('出错了: 必须指定项目名称。');
    process.exit(1);
  }

  // 根据工程名称设置路径
  const prjPath = path.join(process.cwd(), prjName);
  if (fs.existsSync(prjPath)) {
    console.log(`出错了: 文件夹已经存在: ${prjPath}`);
    process.exit(1);
  }
  console.log('Welcome to BatiGOL!');
  fs.mkdirSync(prjPath);

  const tplRepo = 'letmeknowhow/react-app-starter';

  download(tplRepo, prjPath, (err) => {
    if (err) {
      console.log('下载模板失败！');
      console.log(err);
      utils.deleteFolderRecursive(prjPath);
      process.exit(1);
    } else {
      // 修改 package.json
      const appPkgJson = require(path.join(prjPath, 'package.json'));
      appPkgJson.name = prjName;
      appPkgJson.description = `${prjName} created by BatiGOL.`;
      fs.writeFileSync(path.join(prjPath, 'package.json'), JSON.stringify(appPkgJson, null, '  '));


      console.log('工程创建成功!');
      console.log(`如需启动工程，可首先进入 "${prjName}" 目录， 然后执行`);
      console.log(' bizdp start');
      console.log('');
    }
  });
}

module.exports = createApp;
