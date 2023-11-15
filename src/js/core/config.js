import {createOrUpdate} from "./base";
import {defaultHelpSnippet} from "../some";

const GLOBAL_CONFIG = "config"
export const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        this.configs = utools.db.get(GLOBAL_CONFIG)?.data ?? {}
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

        // show help snippet
        if(configManager.get('version') !== defaultHelpSnippet.version){
            configManager.set('version',defaultHelpSnippet.version)
            configManager.set('closeHelpSnippet',false)
        }
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
    }

}