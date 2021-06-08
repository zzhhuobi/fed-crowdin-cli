const fs = require("fs") ;

const exists = (path) => {
    let has;
    try{
        has = !!fs.statSync(path);
    }catch (e) {
        has = false;
    }
    return has;
};

module.exports = {
    exists
};
