import {configManager} from "../../js/utools/config";


/**
 *
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
export function handleCodeEditorKeyDown(e,source){
    const key = e.key;
    if(key === 'Tab'){
        return whenTab(e,source);
    }else if(key === 'Enter'){
        return whenEnter(e,source);
    }else if(key === 'Backspace'){
        return whenBackspace(e,source);
    }else if(key in MATCHED_WORDS){
        return whenMatchedWord(e,source);
    }else if(key in INVERSE_MATCHED_WORDS){
        return whenInverseMatchedWord(e,source);
    }
}

function _getTabChars() {
    switch (configManager.get('default_tab')){
        case 2:
            return '  ';
        case 4:
            return '    ';
        default:
            return '\t';
    }
}
function _substractTabChars(content,count){
    let cur = 0;
    let residue = count;
    while (residue > 0 && cur < content.length){
        const char = content.charAt(cur);
        if(char === ' '){
            residue--;
        }else if(char === '\t'){
            residue -= 4;
        }else{
            break;
        }
        cur++;
    }
    return cur;
}

/**
 *
 * @param {CodeEditorSource} source
 */
function getSelectLines(source){
    // 先往前找到换行符
    const currentLineStart = source.content.lastIndexOf('\n',source.cursorStart-1) + 1;
    const lines = [];
    let lineStart = currentLineStart;
    let lineEnd;
    do{
        lineEnd =  source.content.indexOf('\n',lineStart);
        if(lineEnd === -1){
            lineEnd =  source.content.length;
        }
        lines.push({
            start: lineStart,
            end: lineEnd
        })
        lineStart = lineEnd + 1;
    }while (lineEnd < source.cursorEnd);

    return lines;
}

/**
 *
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
function whenTab(e,source){
    // 获取tabWidth
    const tabChars = _getTabChars();
    if(e.shiftKey){
        // 解析行
        const lines = getSelectLines(source);
        const count = tabChars.length === 1 ? 4 : tabChars.length;
        // 第一行之前的数据不需要缩进处理
        let newContent = source.content.slice(0,lines[0].start);
        // 记录第一行的缩进量
        let firstCur = -1;
        let totalSubstractLength = 0;
        for (const line of lines) {
            // 获取一行内容
            const lineContent = source.content.slice(line.start,line.end + 1);
            // 找到缩进处理后的位置
            const cur = _substractTabChars(source.content.slice(line.start,line.end + 1),count);
            if(firstCur === -1){
                firstCur = cur;
            }
            newContent += lineContent.slice(cur) ;
            totalSubstractLength += cur;
        }
        const lastLength = lines.at(-1).end + 1;
        // 加上后面的文本数据
        if(lastLength < source.content.length){
            newContent += source.content.slice(lastLength);
        }
        // 当cursor不是第一行开头时，需要将cursor位置进行移动
        let cursorStart = source.cursorStart;
        const offset = cursorStart - lines[0].start;
        if(offset < firstCur){
            cursorStart = lines[0].start
        }else{
            cursorStart -= firstCur;
        }
        if(source.cursorStart !== source.cursorEnd){
            return {
                changeType: 'all',
                newContent: newContent,
                newCursorPosition: cursorStart,
                newCursorPositionEnd: source.cursorEnd - totalSubstractLength
            }
        }
        return {
            changeType: 'all',
            newContent: newContent,
            newCursorPosition: cursorStart
        }
    }else{
        if(source.cursorStart === source.cursorEnd){
            // document.execCommand("indent",false,tabChars)
            document.execCommand("insertText", false, tabChars);
            return {
                changeType: "none",
            }
        }
        const lines = getSelectLines(source);
        let newContent = source.content.slice(0,lines[0].start);
        for (const line of lines) {
            newContent += tabChars + source.content.slice(line.start,line.end + 1) ;
        }
        const totalAddLength = tabChars.length * lines.length;
        const lastLength = lines.at(-1).end + 1;
        if(lastLength < source.content.length){
            newContent += source.content.slice(lastLength);
        }
        let cursorStart = source.cursorStart;
        if(cursorStart !== lines[0].start){
            cursorStart += tabChars.length;
        }
        return {
            changeType: 'all',
            newContent: newContent,
            newCursorPosition: cursorStart,
            newCursorPositionEnd: source.cursorEnd + totalAddLength
        }
    }
}

/**
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
function whenEnter(e,source){
    const cursorPosition = source.cursorStart;
    const content = source.content;
    let lineChar = '\n';
    const currentLineStart = content.lastIndexOf('\n',cursorPosition-1) + 1;
    let end = currentLineStart;
    while (end < cursorPosition){
        const char = content.charAt(end);
        if(char === '\r' || char=== '\t' || char === ' '){
            end++
        }else{
            break;
        }
    }
    if(end > currentLineStart){
        lineChar += content.slice(currentLineStart,end);
    }
    if(e.shiftKey){
        // 向后寻找下一个\n
        const currentLineEnd =  content.indexOf('\n',cursorPosition)
        if(currentLineEnd === -1){
            const temp = content+lineChar;
            return {
                changeType: "all",
                newContent: temp,
                newCursorPosition: temp.length
            }
        }else{
            const temp = content.slice(0,currentLineEnd) + lineChar + content.slice(currentLineEnd);
            return {
                changeType: "all",
                newContent: temp,
                newCursorPosition: currentLineEnd + lineChar.length
            }
        }
    }else {
        const temp = content.slice(0, cursorPosition) + lineChar + content.slice(cursorPosition);
        return {
            changeType: "all",
            newContent: temp,
            newCursorPosition: cursorPosition + lineChar.length
        }
    }
}
const MATCHED_WORDS = {
    '(':')',
    '{':'}',
    '[':']',
    "'":"'",
    '"':'"',
    '`':'`'
}
const INVERSE_MATCHED_WORDS =  (()=> {
    const result = {};
    Object.keys(MATCHED_WORDS).forEach(v => {
        result[MATCHED_WORDS[v]] = v
    })
    return result

})()
function isMatchedWord(a,b){
    if(a in MATCHED_WORDS){
        return MATCHED_WORDS[a] === b;
    }
    return false
}

/**
 *
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
function whenBackspace(e,source){
    const start = source.cursorStart;
    const content = source.content;
    if(start === source.cursorEnd  && start < content.length){
        if(isMatchedWord(content[start-1],content[start])){
            return {
                changeType: "all",
                newCursorPosition: start - 1,
                newContent: content.slice(0,start-1)+content.slice(start+1)
            }
        }else if(content[start] === '\n' && content[start-1] === '\n'){
            if(isMatchedWord(content[start-2],content[start+1])){
                return {
                    changeType: "all",
                    newCursorPosition: start - 1,
                    newContent: content.slice(0,start-1)+content.slice(start+1)
                }
            }
        }
    }
}

/**
 *
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
function whenMatchedWord(e,source){
    const start = source.cursorStart;
    const end = source.cursorEnd;
    const content = source.content;
    let newContent;
    if(start === end){
        newContent = content.slice(0,start)+e.key+MATCHED_WORDS[e.key]+content.slice(start);
    }else{
        newContent = content.slice(0,start) + e.key + content.slice(start,end) + MATCHED_WORDS[e.key] + content.slice(end);
    }
    return {
        changeType: "all",
        newCursorPosition: end+1,
        newContent: newContent
    }
}

/**
 * @param {KeyboardEvent} e
 * @param {CodeEditorSource} source
 * @return { CodeEditorChange | null | undefined }
 */
function whenInverseMatchedWord(e,source){
    let start = source.cursorStart;
    const content = source.content;
    if(e.key === content[start] && INVERSE_MATCHED_WORDS[e.key] === content[start-1]){
        start ++;
        return {
            changeType: "cursor",
            newCursorPosition: start
        }
    }
}