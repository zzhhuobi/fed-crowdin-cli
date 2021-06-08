const path = require('path');
const fs = require("fs") ;
const utils = require('./utils');

const config = {
    keys: "",
    project: "",
    apiKey: "",
    output: "",
    prefix: "keys",
    pattern: /^P_[a-zA-Z0-9-_]+:/,
    fileTypes: [".ejs", ".html",'.vue','.js'],
    paths: ["./pages/", "./components/", "./store/"],

    apiBase: 'https://api.crowdin.com/api/project'
};

// 检测自定义配置文件是否存在
const rc = path.resolve(process.cwd(), "./.crowdinrc.js");
utils.exists(rc) && Object.assign(config, require(rc) || {});

module.exports = config;
