import {configManager} from "../core/config";
import {codeSnippetManager} from "../core/snippet";
import {defaultHelpSnippet} from "../some";
import {getSortedArray} from "../utils/sort";

/**
 * @type Hierarchy
 */
export const defaultHierarchy = {
    search(name,tags,type){
        if(configManager.get('version') !== defaultHelpSnippet.version){
            configManager.set('version',defaultHelpSnippet.version)
            configManager.set('closeHelpSnippet',false)
        }
        const array = getSortedArray(codeSnippetManager.queryForMany(name,tags,type));
        if(!configManager.get('closeHelpSnippet')){
            array.unshift(defaultHelpSnippet)
        }
        return {
            sorted: true,
            highlighted: true,
            snippets: array,
        };
    },
    form:{
        containName(name){
            return codeSnippetManager.contain(name)
        }
    }
}




