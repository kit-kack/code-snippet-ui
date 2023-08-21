const fs = require('fs')
const {ipcRenderer} = require('electron')

export const readConfig = (path) => fs.readFileSync(path).toString();
export const writeConfig = (path,str)=> fs.appendFileSync(path,str);

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

export function listen(callback){
    ipcRenderer.on('message',(event,message)=>{
        callback?.(message);
    })
}

export function encodeBase64(str){
    return new Buffer(str).toString('base64')
}
export function decodeBase64(str){
    return new Buffer(str,'base64').toString()
}