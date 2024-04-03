const LIMITED_MAX_RECORD_COUNT = 20;
/**
 * @type {Record<String,CodeEditorChange[]>}
 */
const GLOBAL_REDOS = {};
/**
 * @type {Record<String,CodeEditorChange[]>}
 */
const GLOBAL_UNDOS = {};
/**
 * @type {Record<String,number>}
 */
const GLOBAL_DEP_COUNT = {};

function _initRedoAndUndo(key){
    if(key in GLOBAL_DEP_COUNT){
        GLOBAL_DEP_COUNT[key]++;
    }else{
        GLOBAL_REDOS[key] = [];
        GLOBAL_UNDOS[key] = [];
        GLOBAL_DEP_COUNT[key] = 0;
    }
    return {
        redos: GLOBAL_UNDOS[key],
        undos: GLOBAL_REDOS[key],
    }
}

/**
 *
 * @param { Function<CodeEditorChange> }  fn
 * @param {String} initValue
 * @param [shareKey]
 * @return {{undo: undo, record: record, redo: redo}}
 */
export function useHistory(fn,initValue,shareKey) {
    /**
     * @type CodeEditorChange[]
     */
    let redos;
    /**
     * @type CodeEditorChange[]
     */
    let undos;
    if(shareKey){
        const result = _initRedoAndUndo(shareKey);
        redos = result.redos;
        undos = result.undos;
    }else{
        redos = [];
        undos = [];
    }
    let timer = null;
    let nowChange = {
        changeType: "all",
        newContent: initValue,
        newCursorPosition: initValue.length + 1
    };


    function redo(){
        const change = redos.pop();
        if(change){
            if(nowChange){
                undos.push(nowChange);
                if(undos.length === LIMITED_MAX_RECORD_COUNT){
                    undos.shift();
                }
            }
            nowChange = change
            fn(change);
        }
    }

    /**
     *
     * @param {CodeEditorChange} change
     */
    function record(change){
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            if(undos.length === LIMITED_MAX_RECORD_COUNT){
                undos.shift();
            }
            if(nowChange){
                undos.push(nowChange);
                if(undos.length === LIMITED_MAX_RECORD_COUNT){
                    undos.shift();
                }
            }
            nowChange = change
            timer = null;
        },300)

    }

    function undo(){
        const change = undos.pop();
        if(change){
            if(nowChange){
                redos.push(nowChange);
                if(redos.length === LIMITED_MAX_RECORD_COUNT){
                    redos.shift();
                }
            }
            nowChange = change;
            fn(change);
        }

    }

    return {
        redo,
        record,
        undo
    }
}

export function clearHistory(key){
    if(key){
        GLOBAL_DEP_COUNT[key]--;
        if(GLOBAL_DEP_COUNT[key] === 0){
            delete GLOBAL_REDOS[key];
            delete GLOBAL_UNDOS[key];
            delete GLOBAL_DEP_COUNT[key];
        }
    }
}

export function keepHistory(key){
    if(key){
        GLOBAL_DEP_COUNT[key]++;
    }
}