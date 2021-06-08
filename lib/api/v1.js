const axios = require('axios');

class APIClient {
    constructor(config) {
        this.config = config;
    }
    projectDetails() {
        console.log('project details');
        const { config } = this;
        const url = `${config.apiBase}/${config.project}/info`;
        console.log(url);
        return axios.post(url,{}, {
            params: {
                key: config.apiKey,
                json: true
            }
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
