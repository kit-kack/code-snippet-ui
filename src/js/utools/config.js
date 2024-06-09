import {utools_db_store} from "./base";
import {defaultHelpSnippet, localConfigDirPath} from "../some";
import {adjustTheme} from "../theme";
import {$normal, $reactive} from "../store";

const NEW_GLOBAL_CONFIG = "conf"
export const configManager = {
    configs: {},
    isInited: false,
    init(){
        if(this.isInited){
            return;
        }
        // data
        this.configs = utools.db.get(NEW_GLOBAL_CONFIG)?.data ?? {}
        // init item code show
        const showMode = this.configs["strategy_item_code_show"]
        if(!showMode || showMode < 0 || showMode > 2){
            this.configs["strategy_item_code_show"] = 0;
        }
        if(this.configs['lite']){
            $reactive.main.isFullScreenShow = this.configs['strategy_item_code_show'] === 2;
        }
        $reactive.code.isPure = this.configs['pure_mode']
        if(!(this.configs["strategy_theme"] >= 0 && this.configs["strategy_theme"] <= 4)){
            this.configs["strategy_theme"] = 0;
        }
        if(this.configs["default_tab"] === 0){
            this.configs["default_tab"] = 1;
        }
        // tab
        if(!"default_tab" in this.configs){
            this.configs["default_tab"] = 1;
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
     * @param {ConfigItem} config
     * @return {any}
     */
    get(config){
        return this.configs[config]
    },
    /**
     * @param {ConfigItem} config
     * @param value
     */
    set(config,value){
        if(this.configs[config] === value){
            return;
        }
        this.configs[config] = value;
        utools_db_store(NEW_GLOBAL_CONFIG,this.configs)
    },
    /**
     * @param {ConfigItem} config
     */
    toggle(config){
        this.configs[config] = !this.configs[config];
        utools_db_store(NEW_GLOBAL_CONFIG,this.configs)
    },
    getGlobalColor(){
        return $normal.theme.globalColor;
    },
    getSortKey(){
        return this.configs["strategy_sort"]?? 0;
    },
    /**
     * @param {ConfPath} path
     */
    getSubItem(path){
        const key = NEW_GLOBAL_CONFIG + "-" + path + '.json';
        try{
            return JSON.parse(window.preload.readFile(window.preload.getFinalPath(localConfigDirPath,key)).toString());
        }catch (_){}
    },
    /**
     * @param {ConfPath} path
     * @param config
     */
    setSubItem(path,config){
        preload.writeConfigFile(localConfigDirPath,NEW_GLOBAL_CONFIG + "-" + path + '.json',JSON.stringify(config))
    }
}