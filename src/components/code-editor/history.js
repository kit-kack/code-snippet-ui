/**
 *
 * @param { CallableFunction<CodeEditorChange> }  fn
 * @param {String} initValue
 * @return {{undo: undo, record: record, redo: redo}}
 */
export function useHistory(fn,initValue) {
    const redos = [];
    const undos = [];
    const LIMITED_MAX_RECORD_COUNT = 10;
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