import {$reactive} from "../store";

/**
 * @param {string} searchWord
 */
export function resolveSearchWord(searchWord){
    let tag;
    let type;
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
                    }else {
                        lastBlock = 1;
                    }
                }else if(first === '#'){
                    if (v.length !== 1) {
                        tag = v.slice(1);
                        if(tag[tag.length-1]=== '#'){
                            tag = tag.slice(0,-1)
                            if(tag === ''){
                                tag = undefined;
                            }
                        }else {
                            lastBlock = 2;
                        }
                    }
                }else{
                    if(lastBlock){
                        const last = v[v.length-1];
                        if(lastBlock === 1){
                            if(last === '@'){
                                type += ' ' + v.slice(0,v.length-1);
                                return false
                            }
                        }else if(lastBlock === 2){
                            if(last === '#'){
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
    return {word,tag,type}
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
            temp+= ' #'+aspects.tag;
            if(aspects.tag.includes(' ')){
                temp+= '#'
            }
        }
        if(aspects.type){
            temp+= ' @'+aspects.type;
            if(aspects.type.includes(' ')){
                temp+= '@'
            }
        }
        temp = temp.trim();
        utools.setSubInputValue(temp)
    }else{
        let temp = '';
        if(tag){
            temp = '#'+ tag;
            if(tag.includes(' ')){
                temp += '#'
            }
        }
        utools.setSubInputValue(temp)
    }

    if(!$reactive.utools.focused){
        utools.subInputBlur();
    }
}