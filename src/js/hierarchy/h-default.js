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
        let array = codeSnippetManager.queryForMany(name,tags,type);
        array = getSortedArray(array);
        if(!configManager.get('closeHelpSnippet')){
            array.unshift(defaultHelpSnippet)
        }
        return array;
    }
}




