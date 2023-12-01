import _ from "lodash";
import {codeSnippetManager} from "./snippet";
import {utools_db_store} from "./base";

const KEYWORD_PREFIX = 'keyword/';

/**
 * 添加uTools关键字
 * @param {CodeSnippet} snippet
 * @param {string | null} prefix
 * @param {boolean} [nonNotify]
 */
export function register_utools_keyword(snippet,prefix,nonNotify){
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
    if(!nonNotify && features.length === 0){
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

/**
 * 批量移除utools功能关键字
 * @param prefix
 */
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

export function adapt_old_utools_keyword(){
    const oldKeywords = "code-snippet-keyword";
    const featues = utools.getFeatures([oldKeywords])
    if(_.isEmpty(featues)){
        return
    }
    const cmds = featues[0].cmds;
    if(_.isEmpty(cmds)){
        return;
    }
    for (const codeSnippet of codeSnippetManager.rootSnippetMap.values()) {
        if(cmds.includes(codeSnippet.name)){
            delete codeSnippet.feature;
            codeSnippet.keyword = true;
            utools_db_store("code/"+codeSnippet.id,codeSnippet)
            register_utools_keyword(codeSnippet,null,false)
        }
    }
    // final delete
    utools.removeFeature(oldKeywords)
}