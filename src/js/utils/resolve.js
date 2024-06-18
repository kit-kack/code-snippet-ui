import {$reactive} from "../store";

/**
 * @param {string} searchWord
 */
export function resolveSearchWord(searchWord){
    let tag;
    let fuzzyTag = true;
    let type;
    let fuzzyType = true;
    let lastBlock = 0;
    let word = searchWord.split(/\s/)
        .filter(v=>{
            if(v){
                const first = v[0];
                // @
                if(first === '@'){
                    type = v.slice(1);
                    if(type[type.length-1]=== '@'){
                        type = type.slice(0,-1)
                        fuzzyType = false
                    }else {
                        fuzzyType = true;
                        lastBlock = 1;
                    }
                }else if(first === '#'){
                    if (v.length !== 1) {
                        tag = v.slice(1);
                        if(tag[tag.length-1]=== '#'){
                            tag = tag.slice(0,-1)
                            if(tag === ''){
                                tag = undefined;
                            }else{
                                fuzzyTag = false
                            }
                        }else {
                            fuzzyTag = true;
                            lastBlock = 2;
                        }
                    }
                }else{
                    if(lastBlock){
                        const last = v[v.length-1];
                        if(lastBlock === 1){
                            if(last === '@'){
                                fuzzyType = false;
                                type += ' ' + v.slice(0,v.length-1);
                                return false
                            }
                        }else if(lastBlock === 2){
                            if(last === '#'){
                                fuzzyTag = false;
                                tag +=  ' ' + v.slice(0,v.length-1);
                                return false
                            }
                        }
                    }
                    return true;
                }
            }
        })
        .join(' ');
    if(word){
        word = word.trim().toLowerCase();
    }
    return {word,tag,type,fuzzyType,fuzzyTag};
}
export function replaceOrAddTag(searchWord,tag){
    if(searchWord){
        const aspects = resolveSearchWord(searchWord);
        aspects.tag = tag;

        // 组装 searchWord： name #tag @type
        let temp = '';
        if(aspects.word){
            temp+= aspects.word;
        }
        if(aspects.tag){
            temp+= ' #'+aspects.tag + '#';
        }
        if(aspects.type){
            temp+= ' @'+aspects.type;
            if(aspects.type.includes(' ') || !aspects.fuzzyType){
                temp+= '@'
            }
        }
        temp = temp.trim();
        utools.setSubInputValue(temp)
    }else{
        let temp = '';
        if(tag){
            temp = '#'+ tag + '#';
        }
        utools.setSubInputValue(temp)
    }

    if(!$reactive.utools.focused){
        utools.subInputBlur();
    }
}