import {match} from "../utils/fuzzy";
import {getSortedArray} from "../utils/sort";
import {$normal} from "../store";
import {recongizeFileType} from "../utils/language";

/**
 * @type Hierarchy
 */
export const localDirectoryHierarchy =  {
    search(name,tags,type){
        try{

            const files = window.preload.getAllFilesFromDir($normal.hierarchy.path.at(-1));
            const array = [];
            if(name){
                for (const file of files) {
                    const result = match(name,file.name);
                    if(result){
                        array.push({
                            temp: result,
                            local: true,
                            type: recongizeFileType(file.name),
                            ...file
                        })
                    }
                }
            }else{
                for (const file of files) {
                    array.push({
                        local: true,
                        type: recongizeFileType(file.name),
                        ...file
                    })
                }
            }
            return getSortedArray(array);
        }catch (e){
            $message.error(e.message)
            return [];
        }
    }
}