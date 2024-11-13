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
 *
 * @param {string | undefined} key
 * @return {redos: CodeEditorChange[], undos: CodeEditorChange[]}
 * @private
 */
function _initRedoAndUndo(key){
    if(key){
        if(!(key in GLOBAL_REDOS)){
            GLOBAL_REDOS[key] = [];
            GLOBAL_UNDOS[key] = [];
        }
        return {
            redos: GLOBAL_UNDOS[key],
            undos: GLOBAL_REDOS[key],
        }
    }
    return {
        redos: [],
        undos: [],
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
    const {redos,undos} = _initRedoAndUndo(shareKey)
    let timer = null;
    /**
     * @type {CodeEditorChange}
     */
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
     * @param {CodeEditorChange} nowChangeBackup
     */
    function record(change,nowChangeBackup){
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            if(undos.length === LIMITED_MAX_RECORD_COUNT){
                undos.shift();
            }
            if(nowChange){
                // update nowChange
                if(nowChangeBackup){
                    nowChange.newCursorPosition = nowChangeBackup.newCursorPosition
                    nowChange.newCursorPositionEnd = nowChangeBackup.newCursorPositionEnd
                }
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

/**
 * 在包含code-editor且指定history共享的界面中，<br/>
 * 需要在所有关联的code-editor被销毁后调用本方法来销毁对应的history
 * @param key
 */
export function removeHistory(key){
    if(key && key in GLOBAL_REDOS){
        delete GLOBAL_REDOS[key];
        delete GLOBAL_UNDOS[key];
    }
}
