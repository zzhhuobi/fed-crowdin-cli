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

const copy = function(src,dst){
    let paths = fs.readdirSync(src); //同步读取当前目录
    paths.forEach(function(path){
        var _src=src+'/'+path;
        var _dst=dst+'/'+path;
        fs.stat(_src,function(err,stats){  //stats  该对象 包含文件属性
            if(err)throw err;
            if(stats.isFile()){ //如果是个文件则拷贝
                let  readable=fs.createReadStream(_src);//创建读取流
                let  writable=fs.createWriteStream(_dst);//创建写入流
                readable.pipe(writable);
            }else if(stats.isDirectory()){ //是目录则 递归
                checkDirectory(_src,_dst,copy);
            }
        });
    });
};

const checkDirectory = function(src,dst,callback){
    fs.access(dst, fs.constants.F_OK, (err) => {
        if(err){
            fs.mkdirSync(dst);
            callback(src,dst);
        }else{
            callback(src,dst);
        }
    });
};

const randomString = function (len) {
    len = len || 32;
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

module.exports = {
    exists,
    mkdir,
    copy,
    randomString,
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
