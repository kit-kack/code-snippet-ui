const fs = require('fs')
const path = require('path')
const {clipboard} = require('electron');

/**
 *
 * @param {JSZip} zip
 * @param path
 */
export const generateZip = (zip,path) =>{
    zip.generateAsync({
        type: "uint8array"
    }).then(content =>{
        fs.writeFile(path,content,null,(error)=>{
            if(error){
                utools.showNotification("备份文件出现错误,原因为 "+error.message);
            }else{
                utools.showNotification("备份文件已生成,位于"+path);
            }
        })
    })
}
export const readFile = fs.readFileSync;
export const readREADME_MD = () => fs.readFileSync(path.join(__dirname,'README.md')).toString();
export const writeFile = fs.writeFileSync;
export const renameFile = fs.renameSync;
export const removeFile = fs.unlink;
export const writeConfigFile = (dir,filename,data)=>{
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
    const p = path.join(dir,filename);
    fs.writeFileSync(p,data)
    return p
}

export const dynamicLoadJS = (p) =>{
    try{
        // compare with "plugin://git-repo.js"
        if(p.startsWith('plugin://')){
            p = path.join(__dirname,'hierarchy',p.slice(9))
        }
        return require(p)
    }catch (e){
        utools.showNotification('JS文件解析错误：' + e.message);
        return null
    }
}
const vm = require('vm')

// vm.createContext(context)
// vm.runInContext(`
//     const os = require('os');
//     fetch = undefined;
//     let res = await fetch('https://www.baidu.com')
//     res = await res.text()
//     console.log(res);
// `, context)
// console.log(context)
function notify(...args){
    utools.showNotification(args.join(' '))
}
const emptyFunc = function (){}
const CONTEXT = Object.freeze({
    require,
    fetch,
    console: new Proxy({},{
        get(target,key) {
            if(key === "log" ){
                return notify
            }else{
                return emptyFunc
            }
        }
    }),
    alert:notify,
    atob,
    btoa,
})
vm.createContext(CONTEXT)
export const dynamicRunCode = (code,command,param,globalVar)=>{
    return vm.compileFunction(code,[ 'command', 'param', '$'],{
        parsingContext: CONTEXT
    })(command,param,globalVar)
}

/*
 * 暂未使用到
 * @param path
 * @returns {*[]}
 */
export function getAllFilesFromDir(path) {
    const items = fs.readdirSync(path);
    return items.map(item =>{
        const finalPath = getFinalPath(path,item)
        const stat = fs.statSync(finalPath);
        return {
            name: item,
            path: finalPath,
            dir: stat.isDirectory(),
            time: stat.atimeMs,
            createTime: stat.ctimeMs
        }
    })
}

export function getDirname(p){
    return path.dirname(p)
}
export function getFinalPath(dir,p){
    return path.join(dir,p)
}
export function closePlugin(){
    require('process').exit()
}
export const _clipboard = clipboard;