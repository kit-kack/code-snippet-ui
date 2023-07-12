const fs = require('fs')

export const readConfig = (path) => fs.readFileSync(path).toString();
export const writeConfig = (path,str)=> fs.appendFileSync(path,str);

export function getFilesInDir(path) {
    const items = fs.readdirSync(path);
    const result = [];
    items.forEach(item => {
        const itemPath = `${path}/${item}`;
        const stat = fs.statSync(itemPath);
        if(stat.isFile()){
            result.push({
                name: item,
                path: itemPath
            })
        }
    });
    return result;
}
