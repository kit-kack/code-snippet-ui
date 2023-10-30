const getDBItem = utools.dbStorage.getItem
const removeDBItem = utools.dbStorage.removeItem

// 新版存储 键前缀
const CODE_PREFIX = "code/";
/**
 * @deprecated
 */
const GLOBAL_ROOT_TAGS = "root";
const GLOBAL_TAGS = "tags";
const GLOBAL_CONFIG = "config"
/**
 * @deprecated
 */
const GLOBAL_FORMAT = "format";
const GLOBAL_FUNC = "func";

// 存入数据库的 键前缀 旧版本标记，兼容性，后续版本可能会被移除
const CS_ROOT_ID = "#kitkack.code-snippet-root#"; // 存储所有标签的键
const CS_CONFIG_ID = "#kitkack.code-snippet-config#"  // 配置项前缀
const CS_CODE_ID = "#kitkack.code-snippet-code#";  // 新版标记
const CS_HISTORY_ID = "#kitkack.code-snippet-history#"; // 历史记录（新版本未使用到）
const CS_TAG_COLOR_ID = "#kitkack.code-snippet-tag-color#"; // 标签颜色
// 旧版本标记，兼容性，后续版本可能会被移除
const CS_MARK_ID = "#kitkack.code-snippet#";      // 标签及代码片段部分前缀
const CS_DOC_ID = "#kitkack.code-snippet-doc#";   // 描述部分前缀

function createOrUpdate(key,value){
    const result = utools.db.get(key)
    if(result == null){
        utools.db.put({
            _id: key,
            data: value
        })
    }else{
        utools.db.put({
            _id: key,
            data: value,
            _rev: result._rev
        })
    }
}
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}

export {
    CODE_PREFIX,GLOBAL_ROOT_TAGS,GLOBAL_CONFIG,GLOBAL_FORMAT,GLOBAL_TAGS,GLOBAL_FUNC,
    CS_ROOT_ID,CS_CONFIG_ID,CS_CODE_ID,CS_HISTORY_ID,CS_TAG_COLOR_ID,CS_MARK_ID,CS_DOC_ID,
    createOrUpdate,jsonToMap,getDBItem,removeDBItem
}
