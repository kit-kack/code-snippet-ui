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

export function getDirname(p){
    return path.dirname(p)
}
export function getFinalPath(dir,p){
    return path.join(dir,p)
}
export const _clipboard = clipboard;