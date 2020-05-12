import * as superagent from 'superagent'; // ajax
import * as fs from 'fs';

// const apiPath = 'D:/three/base/code/src/api/' // 文件夹路径
// const apiUrl = 'http://192.168.0.153:8086/v2/api-docs'

// const apiPath = 'D:/three/tgj/code/src/api/' // 文件夹路径
// const apiUrl = 'http://192.168.0.153:8088/v2/api-docs'

// const apiPath = 'D:/three/tgj_less/code/src/api/' // 文件夹路径
// const apiUrl = 'http://192.168.0.153:8092/v2/api-docs'

const apiPath = 'D:/engin-three/base/src/api/'; // 文件夹路径
const apiUrl = 'http://192.168.0.181:8086/v2/api-docs';

interface Swapi {
  tags: Array<{
    name: string; // 模块中文名
    description: string; // 模块英文名称
    content: Array<object>; // 存放按模块整理好的请求 };
  }>;
  paths: {
    [key: string]: {
      get?: MethodsObj;
      post?: MethodsObj;
    };
  };
  definitions: {
    [key: string]: {
      properties: {
        [key: string]: {}; // bo的字段注释
      };
    };
  };
}
interface MethodsObj {
  tags: Array<string>; // 所属模块，中文文件标题
  summary: string; // 接口描述
  consumes: Array<string>; // 接口参数的类型
  parameters: Array<{ name: string }>; // get为参数数组；post为参数bo的地址
}
interface ApiObj extends MethodsObj {
  url: string;
  method: string;
}

// get方法参数排序
const getOrder = {
  getStatisticsByType: ['type', 'year', 'month', 'week'],
};

// 获取文档按文件分类
const getData = async (): Promise<Swapi> => {
  let baseText: Swapi;
  await superagent.get(apiUrl).then((res) => {
    baseText = JSON.parse(res.text);
    // 组装排列content数据
    for (const i in baseText.paths) {
      const res: ApiObj = {
        ...baseText.paths[i].get,
        ...baseText.paths[i].post,
        url: i,
        method: baseText.paths[i].get
          ? 'get'
          : baseText.paths[i].post
          ? 'post'
          : '',
      };
      // get请求固定参数顺序
      if (baseText.paths[i].get) {
        const temOrder = getOrder[res.url.slice(res.url.lastIndexOf('/') + 1)];
        if (temOrder) {
          res.parameters = res.parameters.sort((a, b) => {
            return temOrder.indexOf(a.name) - temOrder.indexOf(b.name);
          });
        }
      }
      // 在对应的tags中插入相关接口
      const searchIndex: number = baseText.tags.findIndex(
        (item) => item.name === res.tags[0],
      );
      if (!baseText.tags[searchIndex].content)
        baseText.tags[searchIndex].content = [];
      baseText.tags[searchIndex].content.push(res);
    }
  });
  return baseText;
};

const create = (baseText: Swapi, textTemplate: Function): void => {
  baseText.tags.forEach((item) => {
    // 生成文件名
    const nameArray: Array<string> = item.description.split(' ');
    nameArray.pop();
    nameArray[0] = nameArray[0].toLowerCase();
    const name = nameArray.join('');
    // 写入文件
    fs.writeFile(
      `${apiPath}${name}.js`,
      textTemplate(item.content, baseText.definitions),
      (err) => {
        if (err) console.log(err);
      },
    );
  });
};

// 文件模板
const textTemplate = (data, definitions): string => {
  let res = `import request from '@/utils/request'
`;
  data.forEach((item) => {
    const apiName = item.url.slice(item.url.lastIndexOf('/') + 1); // 接口名称
    let parameter = ''; // 参数
    let variable = ''; // 传参变量
    if (item.parameters && item.method === 'get') {
      parameter = item.parameters.map((ele) => ele.name).join(', ');
      variable = `params: { ${parameter} }`;
    }
    if (item.parameters && item.method === 'post') {
      parameter = 'data';
      variable = 'data';
    }

    // post方法寻找ob注释
    let label = '';
    if (
      item.parameters &&
      item.method === 'post' &&
      item.consumes[0] === 'application/json'
    ) {
      if (!item.parameters[0].schema) return;
      let address = item.parameters[0].schema.$ref
        ? item.parameters[0].schema.$ref
        : item.parameters[0].schema.items.$ref;
      address = address.slice(address.lastIndexOf('/') + 1);
      for (const i in definitions[address].properties) {
        if (definitions[address].properties.hasOwnProperty(i)) {
          // 判断有无注释
          label = `${label}
 * @param ${i} ${
            definitions[address].properties[i].description
              ? definitions[address].properties[i].description.trim()
              : ''
          }`;
        }
      }
    }

    // 输出模板函数
    res = `${res}
/**
 * @description ${item.summary}${label ? `${label}` : ''}
 */
export function ${apiName}(${parameter}) {
  return request({
    url: '${item.url}',
    method: '${item.method}'${
      item.url.indexOf('download') !== -1
        ? `,
    responseType: 'blob'`
        : ''
    }${
      parameter
        ? `,
    ${variable}`
        : ''
    },
  })
}
`;
  });
  return res;
};

// 运行
const run = async (): Promise<void> => {
  const allData = await getData();
  create(allData, textTemplate);
};

run();
