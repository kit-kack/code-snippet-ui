import {createOrUpdate, CS_CONFIG_ID, getDBItem, GLOBAL_CONFIG, jsonToMap, removeDBItem} from "./base";

export const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        let data = getDBItem(CS_CONFIG_ID)
        if( data != null){
            this.configs = Object.fromEntries(jsonToMap(data).entries())
            console.log(this.configs)
            // 移除旧标签，转移到新标签
            removeDBItem(CS_CONFIG_ID)
            this.writeToDB();
        }else{
            this.configs = utools.db.get(GLOBAL_CONFIG)?.data ?? {}
        }
        // if defaultColor existed, del it
        if(this.configs['defaultColor']){
            this.configs['lightTagColor'] = this.configs['defaultColor']
            this.configs['darkTagColor'] = this.configs['defaultColor'];
            delete this.configs['defaultColor']
            this.writeToDB()
        }
        // refactor: id
        if(this.configs["topList"]){
            delete this.configs["topList"]
            this.writeToDB();
        }
        console.log('configManager init')
        this.isInited = true;
    },
    writeToDB(){
       createOrUpdate(GLOBAL_CONFIG,this.configs)
    },
    /**
     *
     * @param { ConfigItem } config
     * @return {any}
     */
    get(config){
        return this.configs[config]
    },
    /**
     *
     * @param {ConfigItem} config
     * @param value
     */
    set(config,value){
        this.configs[config] = value;
        this.writeToDB();
    },
    /**
     *
     * @param {'SelectedColor' | 'TagColor' | 'HighlightColor' } key
     * @return {*|string}
     */
    getColor(key){
        return this.configs[(utools.isDarkColors()? 'dark':'light')+key]?? '#707070FF';
    },
    /**
     *
     * @param {'SelectedColor' | 'TagColor' | 'HighlightColor' } key
     * @param {String} value
     */
    setColor(key,value){
        this.configs[(utools.isDarkColors()? 'dark':'light')+key] = value;
        this.writeToDB();
    },
    getGlobalColor(){
        if(utools.isDarkColors()){
            return this.configs["darkGlobalColor"]??'#F4B23CEB'; //'#b4a0ff';
        }else{
            return this.configs["lightGlobalColor"]?? '#18A058FF'; // #5c2d91
        }
    },
    setGlobalColor(color){
        if(utools.isDarkColors()){
            this.configs["darkGlobalColor"] =color;
        }else{
            this.configs["lightGlobalColor"] =color;
        }
        this.writeToDB();
    },
    getSortKey(){
        return this.configs["sortKey"]?? 0;
    },
    getTopList(){
        return this.configs["topIdList"]??[];
    },
    addTopItem(id){
        let list = this.getTopList();
        list.push(id)
        this.configs["topIdList"] =list;
        this.writeToDB();
        return list.length-1;
    },
    delTopItem(index){
        let list = this.getTopList();
        list.splice(index,1);
        this.configs["topIdList"] =list;
        this.writeToDB();
    },
    replaceTopItem(index,name){
        let list = this.getTopList();
        list.splice(index,1,name)
        this.configs["topIdList"] =list;
        this.writeToDB();
    }

}