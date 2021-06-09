const config = require('./config');
const APIClient = require('./api/v1');
const git = require('./utils/git');

class Crowdin {
    constructor(){
        this.config = config;
    }
    pull(langs){
        const client = new APIClient(this.config);
        client.downloadTranslations(langs);
    }
    push() {
        git.getDiff().then((diff) => {
            console.log(diff);
        });
    }
}

module.exports = Crowdin;
