import {match} from "../utils/fuzzy";
import {$normal} from "../store";
import {recongizeFileType} from "../utils/language";
import {hierachyHubManager} from "../core/hub";

/**
 * @type Hierarchy
 */
export const localDirectoryHierarchy =  {
    inline: true,
    /**
     *
     * @param prefix
     * @return {HierarchyConfig}
     */
    getConfig(prefix){
        return {
            edit:true,
            form:{
                codeSource: "link",
                linkType: "dir",
                allowUpdatedProperties:{
                    tags: true,
                    feature: true,
                    type: true,
                    desc: true
                }
            }
        }
    },
    search(prefix,name){
        const snippetHub = hierachyHubManager.currentHub.snippets ?? {};
        try{
            const files = window.preload.getAllFilesFromDir($normal.hierarchy.path.at(-1).value);
            const array = [];
            if(name){
                for (const file of files) {
                    const result = match(name,file.name);
                    const snippetData = snippetHub[file.name] ?? {};
                    if(result){
                        array.push({
                            temp: result,
                            ref: "local",
                            type: recongizeFileType(file.name),
                            desc: snippetData.desc,
                            tags: snippetData.tags,
                            ...file
                        })
                    }
                }
            }else{
                for (const file of files) {
                    const snippetData = snippetHub[file.name] ?? {};
                    array.push({
                        ref: "local",
                        type: recongizeFileType(file.name),
                        desc: snippetData.desc,
                        tags: snippetData.tags,
                        ...file
                    })
                }
            }
            return {
                highlighted: true,
                sorted: false,
                snippets: array
            };
        }catch (e){
            $message.error(e.message)
            return null;
        }
    },
    createOrEdit(prefix,snippet,oldName){
        // only edit
        // update type &  desc
        hierachyHubManager.handleDescAndTags(oldName,snippet.desc,snippet.tags)
    }
}