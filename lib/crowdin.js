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
            if(!utils.exists(keysPath)){
                utils.mkdir(keysPath);
            }
        }
    }
    pull(langs){
        const client = new APIClient(this.config);
        client.downloadTranslations(langs);
    }
    push() {
        const { config } = this;
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
        const keysPath = path.resolve(process.cwd(), config.keys);
        const keyFiles = utils.readDirSync(keysPath);
        keyFiles.forEach((file) => {
            const data = fs.readFileSync(file);
            const ws = JSON.parse(data.toString());
            oldWords.push(...ws);
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
                const fullPath = path.resolve(process.cwd(), config.keys + "/" + fileName);
                let old = [];
                if(utils.exists(fullPath)) {
                    const data = fs.readFileSync(fullPath);
                    old = JSON.parse(data.toString());
                }
                newWords.forEach((word) => {
                    if(!old.includes(word)) old.push(word);
                });
                fs.writeFile(fullPath, JSON.stringify(old, '', '\t'), () => {
                    const client = new APIClient(config);
                    client.uploadFile(fullPath);
                });
            });
        });
    }
}

module.exports = Crowdin;
