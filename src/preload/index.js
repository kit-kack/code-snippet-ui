const fs = require('fs')
const path = require('path')
const {clipboard} = require('electron');
export const readConfig = (path) => fs.readFileSync(path).toString();
export const writeConfig = (path,str,flag)=> {
    if(flag){
        return fs.writeFileSync(path,str);
    }else{
        return fs.appendFileSync(path,str);
    }
}
export const readREADME_MD = () => fs.readFileSync(path.join(__dirname,'README.md')).toString();

/*
 * 暂未使用到
 * @param path
 * @returns {*[]}
 */
// export function getFilesInDir(path) {
//     const items = fs.readdirSync(path);
//     const result = [];
//     items.forEach(item => {
//         const itemPath = `${path}/${item}`;
//         const stat = fs.statSync(itemPath);
//         if(stat.isFile()){
//             result.push({
//                 name: item,
//                 path: itemPath
//             })
//         }
//     });
//     return result;
// }
export function encodeBase64(str){
    return new Buffer(str).toString('base64')
}
export function decodeBase64(str){
    return new Buffer(str,'base64').toString()
}

export function getDirname(p){
    return path.dirname(p)
}
export function getFinalPath(dir,p){
    return path.join(dir,p)
}
export const _clipboard = clipboard;