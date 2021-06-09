const nodegit = require('nodegit');
const path = require("path");

module.exports = {
    getRepository() {
        return new Promise((resolve) => {
            nodegit.Repository.open(path.resolve(process.cwd(), ".git")).then((repo) => {
                resolve(repo);
            });
        });
    },
    getDiff() {
        return new Promise((resolve, reject) => {
            this.getRepository().then((repo) => {
                repo.getCurrentBranch().then((ref) => {
                    let branchName = ref.name().replace('refs/heads/', '');
                    console.log(branchName);
                });
            });
        });
    }
};
