const nodegit = require('nodegit');
const path = require("path");

module.exports = {
    getDiff() {
        return new Promise((resolve, reject) => {
            nodegit.Repository.open(path.resolve(process.cwd(), ".git")).then((repo) => {
                repo.getCurrentBranch().then((ref) => {
                    console.log(ref.name());
                });
            });
        });
    }
};
