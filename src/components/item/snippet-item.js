export function getRenderTypeAndCode(snippet,isMultiRenderMode = false){
    let code;
    let renderType = snippet.type?? 'plaintext';
    let isSpecial = false
    if(snippet.image){
        code = snippet.imgId;
        renderType = 'image';
        isSpecial = true;
    } else if(snippet.dir){
        if(snippet.ref === "local"){
            code = snippet.path;
        }else if(snippet.ref === "custom"){
            code = snippet.path;
        }else{
            code = "xxx";
        }
        renderType = 'dir';
        isSpecial = true;
    }else{
        // file
        if(snippet.path){
            if(snippet.link) {
                code = snippet.path;
                renderType = 'link';
                isSpecial = true;
            }else{
                if(renderType === 'image' || renderType === 'svg'){
                    if(isMultiRenderMode){
                        code = snippet.path;
                    }else{
                        code = snippet.path;
                        renderType = 'image';
                        isSpecial = true;
                    }
                }else{
                    code = snippet.path;
                    renderType = 'file';
                    isSpecial = true;
                }
            }
        }else{ // normal code
            code = snippet.code;
        }
    }
    return {code,renderType,isSpecial}
}