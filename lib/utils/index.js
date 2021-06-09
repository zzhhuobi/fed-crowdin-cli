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

const mkdir = (path) => {
    fs.mkdirSync(path);
};

module.exports = {
    exists,
    mkdir,
    readDirSync: (path) => {
        const dirTemp = [];
        const _readDirSync = (path) => {
            let pa = fs.readdirSync(path);
            pa.forEach(function(ele,index){
                if(['.git', '.idea', 'node_modules', 'yarn.lock', 'package-lock.json'].includes(ele))
                    return;
                let info = fs.statSync(path+"/"+ele);
                if(info.isDirectory()){
                    _readDirSync(path+"/"+ele);
                }else{
                    dirTemp.push(path+"/"+ele);
                }
            });
        };
        _readDirSync(path);
        return dirTemp;
    }
};
