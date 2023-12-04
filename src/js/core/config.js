import {utools_db_store} from "./base";
import {defaultHelpSnippet} from "../some";
import {adjustTheme} from "../theme";
import {$normal, $reactive} from "../store";
import {adapt_old_utools_keyword} from "./keyword";

const GLOBAL_CONFIG = "config"
const NEW_GLOBAL_CONFIG = "conf"
export const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        // TODO: 下个大版本移除
        utools.db.remove(GLOBAL_CONFIG)
        adapt_old_utools_keyword()
        // data
        this.configs = utools.db.get(NEW_GLOBAL_CONFIG)?.data ?? {}
        // init item code show
        if(!"strategy_item_code_show" in this.configs){
            this.configs["strategy_item_code_show"] = 0;
        }
        if(this.configs['lite']){
            if(this.configs['strategy_item_code_show'] < 2){
                $reactive.view.fullScreenShow = false;
            }
        }
        $reactive.view.pureView = this.configs['pure_mode']
        if(!(this.configs["strategy_theme"] >= 0 && this.configs["strategy_theme"] <= 4)){
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
        utools_db_store(NEW_GLOBAL_CONFIG,this.configs)
    },
    getGlobalColor(){
        return $normal.theme.globalColor;
    },
    getSortKey(){
        return this.configs["strategy_sort"]?? 0;
    }

}