import {createOrUpdate, CS_TAG_COLOR_ID, getDBItem, GLOBAL_TAGS, jsonToMap, removeDBItem} from "./common";
import {configManager} from "./config";

export const tagColorManager={
    // tag Color Map
    // key: tag name
    // value: color
    tags: {},
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_TAG_COLOR_ID)
        if( data != null){
            this.tags = Object.fromEntries(jsonToMap(data).entries())
            console.log(this.tags)
            // 移除旧标签，转移到新标签
            removeDBItem(CS_TAG_COLOR_ID)
            this.writeToDB();
        }else{
            this.tags = utools.db.get(GLOBAL_TAGS)?.data ?? {}
        }
        this.isInited = true;
    },
    writeToDB(){
        createOrUpdate(GLOBAL_TAGS,this.tags)
    },

    /**
     * @param {string} tag
     * @return {string} - color string
     */
    get(tag){
        return this.tags[tag]?? configManager.getColor('TagColor');
    },
    update(tag,color){
        this.tags[tag] = color;
        this.writeToDB();
    },
    clear(tag){
        if(this.tags[tag] === null){
            this.tags[tag] = undefined;
        }else{
            //处理 颜色
            this.tags[tag] = null;
        }
        this.writeToDB();
    },
    add(tag){  // 仅适用旧版本
        if(this.tags[tag] === undefined){
            this.tags[tag]= null;
        }
    },
    all(){
        return Object.keys(this.tags).filter(t=> this.tags[t] !== undefined)
    }
}