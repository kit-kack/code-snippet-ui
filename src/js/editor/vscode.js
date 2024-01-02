/**
 * @type Editor
 */
export const VSCODE_EDITOR = {
    update(dir,name,code,desc){
        const configPath = window.preload.getFinalPath(dir,'./utools-code-snippet.code-snippets')
        const snippet = {
            prefix: name,
            body: code.split('\n').filter(s => s.length > 0),
            description: desc
        };
        // 判断文件是否存在
        let obj;
        try{
            obj= JSON.parse(window.preload.readFile(configPath).toString());
        }catch (e){
            // 文件不存在
            window.preload.writeFile(configPath,JSON.stringify({
                [name]: snippet
            }))
            return
        }
        if(obj){
            obj[name] = snippet
            window.preload.writeFile(configPath,JSON.stringify(obj,null,2))
        }


    },
    remove(dir,name){
        // 判断文件是否存在
        const configPath = window.preload.getFinalPath(dir,'./utools-code-snippet.code-snippets');
        try{
            const obj= JSON.parse(window.preload.readFile(configPath).toString());
            if(name in obj){
                delete obj[name]
                window.preload.writeFile(configPath,JSON.stringify(obj,null,2))
            }
        }catch (e){}
    }
}