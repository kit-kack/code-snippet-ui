import {codeSnippetManager} from "../core/snippet";
import {GLOBAL_HIERARCHY} from "./core";
import {configManager} from "../core/config";
import {SPECIAL_TAG_HANDLER} from "../editor/editor";
import {defaultHelpSnippet} from "../some";

/**
 *
 * @type {HierarchyConfig}
 */
export const DEFAULT_ROOT_HIERARCHY_CONFIG = {
    edit:true,
    create: true,
    remove: true,
    form:{
        codeSource: "all",
        linkType: "all",
        allowUpdatedProperties:{
            name: true,
            code: true,
            tags: true,
            type: true,
            feature: true,
            desc: true
        },
    }
}
/**
 * @type Hierarchy
 */
export const rootHierachy = {
    core: true,
    inline: true,
    getConfig(prefix){
      return DEFAULT_ROOT_HIERARCHY_CONFIG;
    },
    search(prefix,name){
        return {
            sorted: false,
            highlighted: true,
            snippets: codeSnippetManager.queryForMany(name,GLOBAL_HIERARCHY.currentPrefixIdStr),
        };
    },
    checkNameRepeat(prefix,name){
        return codeSnippetManager.contain(name,GLOBAL_HIERARCHY.currentPrefixIdStr)
    },
    createOrEdit(prefix,snippet,oldName){
        // editor
        if(configManager.get('beta_special_tag')){
            SPECIAL_TAG_HANDLER.accept(snippet,true)
        }
        // sync
        snippet.nativeId = undefined;
        if(snippet.path){
            snippet.nativeId = utools.getNativeId();
        }
        if(snippet.ref){
            if(!snippet.ref.startsWith('plugin://')){
                snippet.nativeId = utools.getNativeId();
            }
        }
        if(oldName){
            // update
            codeSnippetManager.update(snippet,GLOBAL_HIERARCHY.currentPrefixIdStr)
        }else{
            // add
            codeSnippetManager.add(snippet,GLOBAL_HIERARCHY.currentPrefixIdStr)
        }
    },
    remove(prefix,snippet){
        if(snippet.id === defaultHelpSnippet.id){
            configManager.set('readme_close',true)
            return;
        }
        // editor
        if(configManager.get('beta_special_tag')){
            SPECIAL_TAG_HANDLER.accept(snippet,false)
        }
        codeSnippetManager.del(snippet.id,GLOBAL_HIERARCHY.currentPrefixIdStr)
    }
}




