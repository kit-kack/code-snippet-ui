import {createOrUpdate} from "./base";
import {defaultHelpSnippet} from "../some";
import {adjustTheme} from "../theme";
import {$normal} from "../store";

const GLOBAL_CONFIG = "config"
const NEW_GLOBAL_CONFIG = "conf"
export const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        // TODO: 下版本移除
        utools.db.remove(GLOBAL_CONFIG)
        utools.removeFeature("code-snippet-keyword")
        // data
        this.configs = utools.db.get(NEW_GLOBAL_CONFIG)?.data ?? {}
        // init item code show
        if(!"strategy_item_code_show" in this.configs){
            this.configs["strategy_item_code_show"] = 0;
        }
        if(!"strategy_theme" in this.configs){
            this.configs["strategy_theme"] = 0;
        }
        // init theme
        adjustTheme(this.configs["strategy_theme"])
        // show help snippet
        if(configManager.get('version') !== defaultHelpSnippet.version){
            configManager.set('version',defaultHelpSnippet.version)
            configManager.set('readme_close',false)
        }
        console.log('configManager init')
        this.isInited = true;
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
        createOrUpdate(NEW_GLOBAL_CONFIG,this.configs)
    },
    getGlobalColor(){
        return $normal.theme.globalColor;
    },
    getSortKey(){
        return this.configs["strategy_sort"]?? 0;
    }

}