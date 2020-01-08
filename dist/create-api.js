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
// const cheerio = require('cheerio')
// const superagent = require('superagent') // ajax
const superagent = require("superagent"); // ajax
const fs = require("fs");
// const fs = require('fs')
// const path = require('path')
const apiPath = 'D:/october/src/api/'; // 文件夹路径
let baseText = {}; // 全部文档
// 获取文档
const getData = () => __awaiter(void 0, void 0, void 0, function* () {
    yield superagent.get('http://192.168.0.108:8086/v2/api-docs').then(res => {
        baseText = JSON.parse(res.text); // tags:大标题  paths:路径基本信息  definitions:类的详细信息
        // 组装排列数据
        for (const i in baseText.paths) {
            if (baseText.paths.hasOwnProperty(i)) {
                let res = {};
                // 组装get方法
                if (baseText.paths[i].get) {
                    res = Object.assign(Object.assign({}, baseText.paths[i].get), { url: i, method: 'get' });
                    // get请求固定参数顺序
                    let temOrder = getOrder[res.url.slice(res.url.lastIndexOf('/') + 1)];
                    if (temOrder) {
                        res.parameters = res.parameters.sort((a, b) => {
                            return temOrder.indexOf(a.name) - temOrder.indexOf(b.name);
                        });
                    }
                }
                // 组装post方法
                else
                    res = Object.assign(Object.assign({}, baseText.paths[i].post), { url: i, method: 'post' });
                const searchIndex = baseText.tags.findIndex(item => item.name === res.tags[0]);
                if (!baseText.tags[searchIndex].content)
                    baseText.tags[searchIndex].content = [];
                baseText.tags[searchIndex].content.push(res);
            }
        }
    });
});
// get方法参数排序
const getOrder = {
    getStatisticsByType: ['type', 'year', 'month', 'week']
};
const create = () => __awaiter(void 0, void 0, void 0, function* () {
    baseText.tags.forEach(item => {
        // 生成文件名
        let name = item.description.split(' ');
        name.pop();
        name[0] = name[0].toLowerCase();
        name = name.join('').replace();
        // 写入文件
        fs.writeFile(`${apiPath}${name}.js`, textTemplate(item.content), err => {
            if (err)
                console.log(err);
        });
    });
});
// 文件模板
const textTemplate = data => {
    let res = `import request from '@/utils/request'
`;
    data.forEach(item => {
        let apiName = item.url.slice(item.url.lastIndexOf('/') + 1); // 接口名称
        let parameter = ''; // 参数
        let variable = ''; // 传参变量
        if (item.parameters && item.method === 'get') {
            parameter = item.parameters.map(ele => ele.name).join(', ');
            variable = `params: { ${parameter} }`;
        }
        if (item.parameters && item.method === 'post') {
            parameter = 'data';
            variable = 'data';
        }
        // post方法寻找ob注释
        let label = '';
        if (item.parameters &&
            item.method === 'post' &&
            item.consumes[0] === 'application/json') {
            if (!item.parameters[0].schema)
                return;
            let address = item.parameters[0].schema.$ref
                ? item.parameters[0].schema.$ref
                : item.parameters[0].schema.items.$ref;
            address = address.slice(address.lastIndexOf('/') + 1);
            for (const i in baseText.definitions[address].properties) {
                if (baseText.definitions[address].properties.hasOwnProperty(i)) {
                    // 判断有无注释
                    label = `${label}
 * @param ${i} ${baseText.definitions[address].properties[i].description
                        ? baseText.definitions[address].properties[i].description.trim()
                        : ''}`;
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
    method: '${item.method}'${item.url.indexOf('download') !== -1
            ? `,
    responseType: 'blob'`
            : ''}${parameter
            ? `,
    ${variable}`
            : ''}
  })
}
`;
    });
    return res;
};
// 运行
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield getData();
    create();
});
run();