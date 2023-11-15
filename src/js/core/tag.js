import {createOrUpdate} from "./base";
import {configManager} from "./config";

const GLOBAL_TAGS = "tags";
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
        this.tags = utools.db.get(GLOBAL_TAGS)?.data ?? {}
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