const config = require('./config');
const APIClient = require('./api/v1');
const path = require("path");
const utils = require('./utils');
const fs = require("fs") ;
const nodegit = require('nodegit');

const checkFileType = (fileName) => {
    for(const index in config.fileTypes) {
        const type = config.fileTypes[index];
        if(fileName.endsWith(type)){
            return true;
        }
    }
    return false;
};

class Crowdin {
    constructor(){
        this.config = config;
        if(config.keys) {
            const keysPath = path.resolve(process.cwd(), config.keys);
            !utils.exists(keysPath) && utils.mkdir(keysPath);
        }
        if(config.output) {
            const outputPath = path.resolve(process.cwd(), config.output);
            !utils.exists(outputPath) && utils.mkdir(outputPath);
        }
        !utils.exists(config.home) && utils.mkdir(config.home);
        !utils.exists(config.home+ '/download') && utils.mkdir(config.home+ '/download');
        !utils.exists(config.home+ '/source') && utils.mkdir(config.home+ '/source');
        !utils.exists(config.home+ '/result') && utils.mkdir(config.home+ '/result');
    }
    pull(langs){
        const client = new APIClient(this.config);
        client.downloadTranslations(langs).then(() => {
            this.i18n();
        });
    }
    // 重新生成国际化
    i18n() {
        const { config } = this;
        const { languageMap } = config;
        const outputPath = path.resolve(process.cwd(), config.output);

        const sourcePath = `${config.home}source`;
        const sources = utils.readDirSync(sourcePath);
        let sourceObject = {};
        sources.forEach((file) => {
            const json = require(file);
            sourceObject = Object.assign(sourceObject, json);
        });

        Object.keys(languageMap).forEach((key) => {
            const langVar = languageMap[key];
            const { crowdin, LANG } = langVar;
            const filePath = `${outputPath}/${LANG}.json`;
            console.log(filePath);
            const resultFile = `${config.home}result/${crowdin}`;
            const files = utils.readDirSync(resultFile);
            let resultObject = {};
            files.forEach((file) => {
                const json = require(file);
                resultObject = Object.assign(resultObject, json);
            });
            // 准备语言文件
            const resultData = {};
            Object.keys(sourceObject).forEach((objectKey) => {
                const key = sourceObject[objectKey];
                const value = resultObject[objectKey] || key;
                resultData[key] = value;
            });
            const fileData = {};
            fileData[LANG] = resultData;

            // 写入工程
            fs.writeFile(filePath, JSON.stringify(fileData, '', '\t'), () => {});
        });
    }
    syncSource() {
        return new Promise((resolve, reject) => {
            const client = new APIClient(config);
            client.downloadTranslations().then(resolve).catch(reject);
        });
    }
    push() {
        const { config } = this;
        const sourcePath = `${config.home}/source`;

        this.syncSource().then((result) => {
            const root = path.resolve(process.cwd(), '');
            const files = utils.readDirSync(root);
            const words = []; // 文件中的词条
            const oldWords = [];
            const newWords = [];
            files.forEach((file) => {
                const checked = checkFileType(file);
                if(!checked)
                    return;
                const data = fs.readFileSync(file);
                data.toString().replace(/{#(.+?)#}/g, ($,$1) => {
                    words.push($1);
                });
            });

            const keyFiles = utils.readDirSync(sourcePath);
            keyFiles.forEach((file) => {
                const data = fs.readFileSync(file);
                const ws = JSON.parse(data.toString());
                Object.keys(ws).forEach((key) => {
                    oldWords.push(ws[key]);
                });
            });

            words.forEach((word) => {
                if(!oldWords.includes(word))
                    newWords.push(word);
            });

            nodegit.Repository.open(path.resolve(process.cwd(), ".git")).then((repo) => {
                repo.getCurrentBranch().then((ref) => {
                    let branchName = ref.name().replace('refs/heads/', '');
                    let fileName = branchName;
                    if(!(branchName === 'main' || branchName === 'master')) {
                        fileName = config.prefix + "_" + fileName.replace('BRANCH_', '');
                    }
                    fileName = fileName + '.json';
                    const keyPath = path.resolve(process.cwd(), config.keys + "/" + fileName);
                    const oldSourceFile = sourcePath + '/' + fileName;
                    let old = [];
                    let thisFileNew = [];
                    let oldJson = {};
                    if(utils.exists(oldSourceFile)) {
                        const data = fs.readFileSync(oldSourceFile);
                        oldJson = JSON.parse(data.toString());
                        Object.keys(oldJson).forEach((k) => {
                            old.push(oldJson[k]);
                        });
                    }
                    newWords.forEach((word) => {
                        if(!old.includes(word)) thisFileNew.push(word);
                    });
                    thisFileNew.forEach((item) => {
                        const key = 'K'+utils.randomString(8).toUpperCase();
                        oldJson[key] = item;
                    });
                    const newAllKey = [];
                    Object.keys(oldJson).forEach((k) => {
                        newAllKey.push(oldJson[k]);
                    });

                    // 写入工程
                    fs.writeFile(keyPath, JSON.stringify(newAllKey, '', '\t'), () => {});
                    // 写入缓存
                    fs.writeFile(oldSourceFile, JSON.stringify(oldJson, '', '\t'), () => {
                        const client = new APIClient(config);
                        client.uploadFile(oldSourceFile);
                    });
                });
            });
        });
    }
}

module.exports = Crowdin;
