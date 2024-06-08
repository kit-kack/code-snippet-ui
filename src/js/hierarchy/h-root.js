import {codeSnippetManager} from "../utools/snippet";
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
        // determin recycle
        // determine recycle
        // if(isRecycleBinModeActive){
        //     if(id in recycleBin){
        //         item.expired = recycleBin[id].expired - timeStamp;
        //         if(item.expired < 0){
        //             // TODO: 过期处理
        //             GLOBAL_HIERARCHY.remove(snippet,true);
        //             continue;
        //         }
        //     }else{
        //         continue;
        //     }
        // }else{
        //     if(id in recycleBin){
        //         continue;
        //     }
        // }
        return {
            sorted: false,
            highlighted: true,
            snippets: codeSnippetManager.queryForMany(name,GLOBAL_HIERARCHY.currentPrefixIdStr),
        };
    },
    checkNameRepeat(prefix,name){
        return codeSnippetManager.contain(name,GLOBAL_HIERARCHY.currentPrefixIdStr)
    },
    async createOrEdit(prefix,snippet,oldName){
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
            await codeSnippetManager.update(snippet,GLOBAL_HIERARCHY.currentPrefixIdStr)
        }else{
            // add
            await codeSnippetManager.add(snippet,GLOBAL_HIERARCHY.currentPrefixIdStr)
        }
    },
    remove(prefix,snippet){
        codeSnippetManager.del(snippet.id,GLOBAL_HIERARCHY.currentPrefixIdStr)
    }
}




