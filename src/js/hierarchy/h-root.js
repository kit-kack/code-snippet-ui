import {codeSnippetManager} from "../core/snippet";
import {GLOBAL_HIERARCHY} from "./core";

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
            snippets: codeSnippetManager.queryForMany(name,GLOBAL_HIERARCHY.currentPrefixStr),
        };
    },
    checkNameRepeat(prefix,name){
        return codeSnippetManager.contain(name,GLOBAL_HIERARCHY.currentPrefixStr)
    },
    createOrEdit(prefix,snippet,oldName){
        if(oldName){
            // update
            codeSnippetManager.update(snippet,GLOBAL_HIERARCHY.currentPrefixStr)
        }else{
            // add
            codeSnippetManager.add(snippet,GLOBAL_HIERARCHY.currentPrefixStr)
        }
    },
    remove(prefix,snippet){
        codeSnippetManager.del(snippet.id,GLOBAL_HIERARCHY.currentPrefixStr)
    }
}




