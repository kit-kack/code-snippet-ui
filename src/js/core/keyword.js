const KEYWORD_PREFIX = 'keyword/';

/**
 * 添加uTools关键字
 * @param {CodeSnippet} snippet
 * @param {string | null} prefix
 */
export function register_utools_keyword(snippet,prefix){
    let keyword = KEYWORD_PREFIX;
    if(prefix){
        keyword += prefix+"#";
    }
    keyword += snippet.id;
    let info = snippet.desc ?? '暂无描述';
    if(snippet.dir){
        info = "[快速访问目录]："+info
    }else{
        info = "[快速粘贴内容]："+info
    }
    // 获取
    const features = utools.getFeatures([keyword])
    // register
    utools.setFeature({
        code: keyword,
        explain: info,
        cmds: [snippet.name]
    })
    if(features.length === 0){
        $message.success("新增uTools关键字："+snippet.name)
    }
}

/**
 * 移除uTools关键字
 * @param {CodeSnippet} snippet
 * @param {string | null} prefix
 */
export function delete_utools_keyword(snippet,prefix){
    let keyword = KEYWORD_PREFIX;
    if(prefix){
        keyword += prefix+"#";
    }
    keyword += snippet.id;
    // 获取
    const features = utools.getFeatures([keyword])
    // delete
    if(features.length > 0){
        utools.removeFeature(keyword)
        $message.info("移除uTools关键字："+snippet.name)
    }
}


export function batch_delete_utools_keyword(prefix){
    const p1 = KEYWORD_PREFIX + prefix + "/";
    const p2 = KEYWORD_PREFIX + prefix + "#";
    const features = utools.getFeatures();
    for (const feature of features) {
        console.log(feature.code)
        if(feature.code.startsWith(p1) || feature.code.startsWith(p2)){
            utools.removeFeature(feature.code)
        }
    }
}