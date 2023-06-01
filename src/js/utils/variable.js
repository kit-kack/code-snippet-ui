import {nextTick, ref} from "vue";
import {codeSnippetManager, configManager} from "../core.js";
// 控制 CodeView 滚动条滚动
const scrollCodeInvoker = ref();
const scrollListInvoker = ref();
const ctrlKey = utools.isMacOS() ? 'command':'ctrl';
const CtrlStr = utools.isMacOS()? 'Command':'Ctrl'
// 控制整体模式
const LIST_VIEW = 0;
const CODE_VIEW = 1;
const UPDATE_VIEW = 2;
const CREATE_VIEW = 3;
// 控制整体Vim模式，以及Utools输入框失焦和聚焦
const focusOnUtoolsInput = ref(true);
const selectIndex = ref(0)
const subItemSelectIndex = ref(-1)
const currentMode = ref(LIST_VIEW);
const currentName = ref()
const utoolsSearchContent = ref('')
// 控制长按键
const longKeyDown = ref(false);
const onConfirm = ref(false)
// 控制 空格 执行操作
const spaceInvokers = ref([])

const itemOffsetArray = ref([]);
// 控制 选中元素 保持记忆功能
const keepSelectedStatus = ref(null)   // null false true
const scrollbarMovedDistance = { distance: 0 }
// 控制侧边
const settingActive = ref(false);






const handleDeleteConfirm = (name,refreshFunc)=>{
    onConfirm.value = true;
     window.$dialog.warning({
        title:'警告',
        content:`你确定删除该代码片段【${name}】?`,
        positiveText:'确定(Enter)',
        negativeText:'取消(Space)',
        onPositiveClick: ()=>{
            onConfirm.value = false;
            codeSnippetManager.del(name)
            keepSelectedStatus.value = null;
            window.$message.success("成功删除")
            refreshFunc();
        },
        onNegativeClick: ()=>{
            onConfirm.value = false;
        },
        onClose: ()=>{
            onConfirm.value = false;
        },
    })
}

/**
 *
 * @param {boolean | undefined | null} isPasted
 */
const handleCopy = (isPasted)=>{
    // 获取当前文本
    const codeSnippet = codeSnippetManager.get(currentName.value);
    // 更新次数和时间
    codeSnippet.time = Date.now();
    codeSnippet.count = (codeSnippet.count??0) +1;
    codeSnippetManager.update(codeSnippet)
    // 复制
    utools.copyText(codeSnippet.code);
    $message.success(`已复制代码片段${currentName.value}的内容`)
    // 粘贴
    if(isPasted){
        utools.hideMainWindow();
        utools.simulateKeyboardTap('v',ctrlKey);
    }
}


/**
 * @param list - 查询列表
 * @param refreshFunc - 刷新函数
 */
function init(list,refreshFunc){
    document.onkeydown = e=>{
        // dialog or sideview
        if(settingActive.value){
            // prevent any possible event
            if(e.code === 'Space' || e.code === 'Enter' || e.code === 'Tab'){
                e.preventDefault();
            }
            return;
        }
        if(onConfirm.value){
            if(e.code === 'Tab'){
                e.preventDefault();
            }else if(e.code === 'Enter'){
                onConfirm.value = false;
                codeSnippetManager.del(currentName.value)
                keepSelectedStatus.value = null;
                window.$message.success("成功删除")
                refreshFunc();
            }
            return;
        }
        // update view or create view
        if(currentMode.value > CODE_VIEW){  // ignore
            // TODO: deal with 'Tab' key
            return;
        }
        if(e.code === 'Enter' ){
            handleCopy(true)
            return;
        }else if(e.code === 'Tab'){
            e.preventDefault();
            if(focusOnUtoolsInput.value && selectIndex.value > -1){
                focusOnUtoolsInput.value = false;
                utools.subInputBlur();
            }else{
                utools.subInputFocus();
                focusOnUtoolsInput.value = true;
            }
            return;
        }
        // just for list view
        if(focusOnUtoolsInput.value  || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey){
            return;
        }
        if(currentMode.value === LIST_VIEW){
            switch (e.code){
                case "KeyH":
                case "ArrowLeft":
                    // 校验是否有效
                    if(selectIndex.value=== -1){
                        if(configManager.get("enabledBeep")){
                            utools.shellBeep();
                        }
                    }else{
                        if(subItemSelectIndex.value === -1){
                            subItemSelectIndex.value = 4;
                        }else{
                            subItemSelectIndex.value --;
                        }
                    }
                    break;
                case "KeyJ":
                case "ArrowDown":
                    if (selectIndex.value >= list.value.length - 1) { // -1 >= 0-1
                        if(configManager.get("enabledBeep")){
                            utools.shellBeep();
                        }
                    } else {
                        selectIndex.value++;
                        subItemSelectIndex.value = -1;
                        scrollListInvoker.value?.("down")

                    }
                    break;
                case "KeyK":
                case "ArrowUp":
                    if (selectIndex.value <= 0) {
                        if(configManager.get("enabledBeep")){
                            utools.shellBeep();
                        }
                    } else {
                        selectIndex.value--;
                        subItemSelectIndex.value = -1;
                        scrollListInvoker.value?.("up")
                    }
                    break;
                case "KeyL":
                case "ArrowRight":
                    // 校验是否有效
                    if(selectIndex.value=== -1 ){
                        if(configManager.get("enabledBeep")){
                            utools.shellBeep();
                        }
                    }else{
                        if(subItemSelectIndex.value === 4){
                            subItemSelectIndex.value = -1;
                        }else{
                            subItemSelectIndex.value ++;
                        }
                    }
                    break;
                case "Space":
                    if(subItemSelectIndex.value === -1){
                        if(e.repeat){
                            currentMode.value = CODE_VIEW;
                            longKeyDown.value = true;
                        }
                    }else{
                        // 处理 Vim 操作
                        spaceInvokers.value[subItemSelectIndex.value]?.()
                    }
                    break;
            }
        }else if(currentMode.value === CODE_VIEW){
            switch (e.code){
                case "KeyH":
                case "ArrowLeft":
                    scrollCodeInvoker.value?.("left");
                    break;
                case "KeyJ":
                case "ArrowDown":
                    scrollCodeInvoker.value?.("down");
                    break;
                case "KeyK":
                case "ArrowUp":
                    scrollCodeInvoker.value?.("up");
                    break;
                case "KeyL":
                case "ArrowRight":
                    scrollCodeInvoker.value?.("right");
                    break;
            }
        }
    }
    document.onkeyup = e=>{
        if(settingActive.value){
            return;
        }
        if(e.ctrlKey || e.metaKey) {
            if (e.code === 'KeyN' && currentMode.value<=CODE_VIEW) {
                currentMode.value = CREATE_VIEW;
                return;
            }else if(e.code === 'KeyR' && currentMode.value === LIST_VIEW){
                refreshFunc();
                return;
            }else if(e.code === 'KeyF' && currentMode.value === LIST_VIEW){
                if(configManager.get("enabledFuzzySymbolQuery")){
                    configManager.set("enabledFuzzySymbolQuery",false)
                    $message.info("退出【模糊符号查询】模式")
                }else{
                    configManager.set("enabledFuzzySymbolQuery",true)
                    $message.success("进入【模糊符号查询】模式")
                }
            }
        }

        if(focusOnUtoolsInput.value  || selectIndex.value < 0 || currentMode.value > CODE_VIEW || onConfirm.value || e.shiftKey || e.altKey ){
            return;
        }
        if(currentMode.value === LIST_VIEW){
            if(e.code === 'KeyV'){
                currentMode.value = CODE_VIEW;
                return;
            }else if(e.code === 'KeyE'){
                currentMode.value = UPDATE_VIEW;
                return;
            }
        }
        if(e.ctrlKey || e.metaKey || selectIndex.value < 0){
            return;
        }
        switch (e.code){
            case 'KeyQ':
                if(currentMode.value === CODE_VIEW){
                    currentMode.value = LIST_VIEW;
                    keepSelectedStatus.value = true;
                }
                break;
            case 'KeyC':
            case 'KeyY':
                handleCopy()
                break;
            case 'KeyT':
                let index = configManager.getTopList().indexOf(currentName.value)
                if(index === -1){
                    configManager.addTopItem(currentName.value);
                }else{
                    configManager.delTopItem(index)
                }
                refreshFunc()
                break;
            case 'KeyP':
                handleCopy(true)
                break;
            case 'Space':
                e.preventDefault();
                if(longKeyDown.value){
                    longKeyDown.value = false;
                    currentMode.value = LIST_VIEW;
                    keepSelectedStatus.value = true;
                    return;
                }
                if(currentMode.value === LIST_VIEW){
                    // 校准位置
                    if(selectIndex.value > -1 ){
                        if(itemOffsetArray.value[selectIndex.value] != null){
                            scrollListInvoker.value?.(itemOffsetArray.value[selectIndex.value])
                        }
                    }
                }
                break;
            case 'KeyD':
            case 'KeyX':
                handleDeleteConfirm(currentName.value,refreshFunc)
                break;
        }
    }
}

const calculateTime =(time)=>{
    if(time == null){
        return '未知';
    }
    let old = new Date(time);
    let difftime = (Date.now() -old)/1000; //计算时间差,并把毫秒转换成秒
    let days = Math.trunc(difftime/86400); // 天  24*60*60*1000
    if(days > 0){
        if(days > 10){
            return old.toLocaleDateString();
        }else if(days === 1){
            return '昨天'
        }else if(days === 2){
            return '前天'
        }else{
            return days+'天前'
        }
    }
    let hours = Math.trunc(difftime/3600)-24*days;    // 小时 60*60 总小时数-过去的小时数=现在的小时数
    if(hours > 0){
        return hours+'小时前';
    }
    let minutes = Math.trunc(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    if(minutes > 0){
        return minutes+'分钟前';
    }
    let seconds = Math.trunc(difftime%60);  // 以60秒为一整份 取余 剩下秒数

    if(seconds> 0){
        return seconds+'秒前';
    }
    return '现在';
}


/**
 *
 * @param {string} searchWord
 * @param selectedIndex
 */
function parseSearchWord(searchWord,selectedIndex){
    let array;
    if(searchWord == null || searchWord.length === 0){
        array = codeSnippetManager.queryForMany(null,null,null)
    }else{
        const words = searchWord.split(/\s/).filter(v=>v.length>=1)
        let name = null;
        let type = null;
        let tags = [];
        for (let word of words) {
            if(word[0] === '@'){
                if(word.length !== 1){
                    type = word.slice(1)
                }
            }else if(word[0] === '#'){
                if(word.length !== 1){
                    tags.push(word.slice(1))
                }
            }else{
                name = word;
            }
        }
        array = codeSnippetManager.queryForMany(name,tags,type)
    }

    // 判断 keepSelectedStatus ，如果为true，需要保留selectIndex位置
    // 由于默认keepSelectedStatus为true，则selectIndex可能为非法，这时候需要忽视keepSelectedStatus
    // 只有当 删除/添加/搜索操作时，会将keepSelectedStatus置为false
    if( selectedIndex.value<0 || selectedIndex.value>=array.length ||   keepSelectedStatus.value===null){
        selectedIndex.value = (array.length===0)? -1: 0;
    }else if(keepSelectedStatus.value){
        nextTick(()=>{
            // 校准位置
            console.log('go to the last position')
            if(itemOffsetArray.value[selectedIndex.value] != null){
                scrollListInvoker.value?.(itemOffsetArray.value[selectedIndex.value])
            }
        })
    }
    subItemSelectIndex.value = -1;
    // 重置
    keepSelectedStatus.value = false;
    return array;
}




export {
    init,
    CODE_VIEW, LIST_VIEW, UPDATE_VIEW, CREATE_VIEW,
    focusOnUtoolsInput,
    handleDeleteConfirm,
    currentName,
    currentMode,
    selectIndex,
    subItemSelectIndex,
    utoolsSearchContent,
    calculateTime,
    handleCopy,
    spaceInvokers,CtrlStr,settingActive,keepSelectedStatus,scrollbarMovedDistance,
    scrollListInvoker,
    scrollCodeInvoker,
    itemOffsetArray,
    parseSearchWord
}