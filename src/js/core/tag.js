import {utools_db_store} from "./base";

const GLOBAL_TAGS = "tags";
const NEW_GLOBAL_TAGS = "tag";
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
        let data = utools.db.get(GLOBAL_TAGS)?.data;
        if(data){
            // convert
            for (const tag in data) {
                if(data[tag]){
                    this.tags[tag] = null;
                }else{
                    this.tags[tag] = {
                        "background": data[tag],
                        "color": "white"
                    }
                }
            }
            // remove
            this.writeToDB();
            utools.db.remove(GLOBAL_TAGS)
        }else{
            this.tags = utools.db.get(NEW_GLOBAL_TAGS)?.data ?? {}
        }
        this.isInited = true;
    },
    writeToDB(){
        utools_db_store(NEW_GLOBAL_TAGS,this.tags)
    },

    /**
     * @param {string} tag
     * @param {boolean} [isDefaultTheme]
     */
    get(tag,isDefaultTheme){
        const defaultTheme = {
            "background":utools.isDarkColors()?  "linear-gradient(135deg,#304352,#d7d2cc)": "#eaeaea",
            "color": utools.isDarkColors()?  "#FFFFFF": "#929292"
        };
        if(isDefaultTheme){
            return defaultTheme;
        }
        return this.tags[tag]?? defaultTheme;
    },
    update(tag,style){
        this.tags[tag] = style;
        this.writeToDB();
    },
    clear(tag){
        this.tags[tag] = undefined;
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