import {$index, $normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../store";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {K_SHORTCUT} from "./k-shortcut";
import {K_CODEVIEW} from "./k-codeview";
import {K_LISTVIEW} from "./k-listview";
import {CountType, statisticsManager} from "../core/statistics";

export const GLOBAL_KEYBOARD_HANDLER = {
    isInited: false,
    prevCode: null,
    prevRepeatCode: null,
    prevMode: null,
    isNewKeyLongPressed: null,
    lastPressedTime: 0,
    getExt(e){
        // 提供参数
        const code = e.code;
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey || e.metaKey;
        const alt = e.altKey;
        // double
        const gap = e.timeStamp - this.lastPressedTime;
        const double = gap > 50 && gap < 300 &&  this.prevCode === code;

        // repeat
        const repeat = e.repeat;

        // long
        if(repeat){
            if(code === this.prevRepeatCode){
                this.isNewKeyLongPressed = false
            }else{
                // new key is long pressed
                this.isNewKeyLongPressed = true
                this.prevRepeatCode = code
                this.prevMode = $reactive.currentMode
            }
        }else{
            this.prevRepeatCode = null
        }
        const long = repeat && this.isNewKeyLongPressed;

        // 更新上一次按键
        this.prevCode = e.code;
        this.lastPressedTime = e.timeStamp;
        return {
            code,
            shift,
            ctrl,
            alt,
            repeat,
            double,
            long
        }
    },

    init(){
        if(this.isInited){
            return
        }
        // init keyboard
        document.onkeydown= (e)=>{
            // 主动禁用
            if($reactive.utools.vimDisabled){
                return;
            }
            // 在 FORM_VIEW下禁用
            if ($reactive.currentMode >= EDIT_VIEW) {
                return;
            }
            // 需要输入的场景被禁用
            if($reactive.common.variableActive || $reactive.main.tagColorActive){
                return;
            }
            // 提供参数
            const ext = this.getExt(e)
            // 快捷键界面场景
            if($reactive.common.shortcutActive){
                K_SHORTCUT(ext) && e.preventDefault();
                return;
            }

            if ($reactive.currentMode === LIST_VIEW) {
                // LIST_VIEW场景
                K_LISTVIEW(ext) && e.preventDefault();
            } else {
                // CODE_VIEW场景
                K_CODEVIEW(ext) && e.preventDefault();
            }
        }

        document.onkeyup = e => {
            if ($reactive.utools.vimDisabled || $reactive.main.settingActive || $reactive.utools.focused || $index.value < 0 || $reactive.currentMode >= EDIT_VIEW) {
                return;
            }
            statisticsManager.count(CountType.VIM)
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isNewKeyLongPressed !== null && this.prevMode === LIST_VIEW) {
                    GLOBAL_HIERARCHY.changeView(LIST_VIEW)
                    this.isNewKeyLongPressed = null
                    return;
                }
                if ($reactive.currentMode === LIST_VIEW) {
                    if ($reactive.utools.subItemSelectedIndex !== -1) {
                        // 处理 Vim 操作
                        $normal.spaceInvoker[$reactive.utools.subItemSelectedIndex]?.()
                    }
                }
            }
        }
        this.isInited = true


    },

}