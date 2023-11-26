import {createOrUpdate} from "./base";

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
        return this.tags[tag]?? (utools.isDarkColors()? '#5E5E5EFF':'#64696FAD');
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
    },
    backup(zip, filename) {
        zip.file(filename,JSON.stringify({
            tags: tagColorManager.tags
        }))
    },
    async load(zip, filename) {
        try{
            const obj = JSON.parse(await zip.file(filename).async("string"))
            if(obj && obj.tags){
                for (const tag in obj.tags) {
                    tagColorManager.tags[tag] = obj.tags[tag]
                }
                tagColorManager.writeToDB()
            }
        }catch (e){
            utools.showNotification(`解析${filename}时发生异常，原因为${e.message}`)
        }
    }
}