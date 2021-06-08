const config = require('./config');
const APIClient = require('./api/v1');

class Crowdin {
    constructor(){
        this.config = config;
    }
    pull(langs){
        const client = new APIClient(this.config);
        client.downloadTranslations(langs);
    }
}

module.exports = Crowdin;
