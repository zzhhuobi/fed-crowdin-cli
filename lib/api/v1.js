const axios = require('axios');
const fs = require("fs");
const FormData = require('form-data');
const got = require('got');

class APIClient {
    constructor(config) {
        this.config = config;
    }
    projectDetails() {
        const { config } = this;
        const url = `${config.apiBase}/${config.project}/info`;
        return axios.post(url,{}, {
            params: {
                key: config.apiKey,
                json: true
            }
        });
    }
    uploadFile(file) {
        const pathArray = file.split('/');
        const fileName = pathArray[pathArray.length-1];
        const detail = this.projectDetails();
        detail.then((result) => {
            const files = result.data.files;
            const names = files.map(({name}) => { return name;});
            if(names.includes(fileName)) { // 更新文件
                this.addAndUpdateFile(file, false);
            }else { // 添加文件
                this.addAndUpdateFile(file, true);
            }
        });
    }
    addAndUpdateFile(file, add) {
        const pathArray = file.split('/');
        const fileName = pathArray[pathArray.length-1];
        const { config } = this;
        const url = `${config.apiBase}/${config.project}/${add ? 'add-file' : 'update-file'}`;

        let data = new FormData();
        data.append(`export_patterns[${fileName}]`,'%original_file_name%');
        data.append(`files[${fileName}]`, fs.readFileSync(file), {
            filename: fileName,
            contentType: 'application/json'
        });

        got(url, {
            method: 'post',
            searchParams: {
                key: config.apiKey,
                json: 'json'
            },
            body: data
        });
    }
    downloadTranslations(langs) {
        if(langs.length) {

        }else{
            // 下载全部

        }
    }
}

module.exports = APIClient;
