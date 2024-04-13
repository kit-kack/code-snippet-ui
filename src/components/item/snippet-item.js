export function getRenderTypeAndCode(snippet){
    let code;
    let renderType = snippet.type?? 'plaintext';
    if(snippet.image){
        code = "[图片]: 存储在utools中，支持同步";
        renderType = 'plaintext';
    } else if(snippet.dir){
        if(snippet.ref === "local"){
            code = "[本地目录]: "+snippet.path;
        }else if(snippet.ref === "custom"){
            code = "[自定义目录]: "+snippet.path;
        }else{
            code = "[普通目录] ";
        }
        renderType = 'plaintext';
    }else{
        // file
        if(snippet.path){
            if(snippet.link) {
                code = '[关联链接]: ' + snippet.path;
                renderType = 'plaintext';
            }else{
                if(renderType === 'image' || renderType === 'svg'){
                    code = '[关联图片]: '+snippet.path;
                    renderType = 'plaintext';
                }else{
                    code = '[关联片段]: '+snippet.path;
                    renderType = 'plaintext';
                }
            }
        }else{ // normal code
            code = snippet.code;
        }
    }
    return {code,renderType}
}