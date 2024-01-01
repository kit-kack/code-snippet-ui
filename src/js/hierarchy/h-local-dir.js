import {match} from "../utils/fuzzy";
import {$normal} from "../store";
import {recongizeFileType} from "../utils/language";

/**
 * @type Hierarchy
 */
export const localDirectoryHierarchy =  {
    inline: true,
    getConfig(){
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
        try{
            const files = window.preload.getAllFilesFromDir($normal.hierarchyPath.at(-1).value);
            const array = [];
            if(name){
                for (const file of files) {
                    const result = match(name,file.name);
                    if(result){
                        array.push({
                            temp: result,
                            ref: "local",
                            type: recongizeFileType(file.name),
                            ...file
                        })
                    }
                }
            }else{
                for (const file of files) {
                    array.push({
                        ref: "local",
                        type: recongizeFileType(file.name),
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
    createOrEdit(prefix,snippet,oldName,ext){
        // only edit
        // update type &  desc
        ext.store(oldName,{
            type: snippet.type,
            desc: snippet.desc,
            tags: snippet.tags,
        })
    }
}