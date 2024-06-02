import {$normal, $reactive, EDIT_VIEW, LIST_VIEW} from "../store";
import {K_SHORTCUT_DOWN} from "./k-shortcut";
import {K_CODEVIEW_DOWN, K_CODEVIEW_UP} from "./k-codeview";
import {K_LISTVIEW_DOWN, K_LISTVIEW_UP} from "./k-listview";
import {K_SETTING_DOWN} from "./k-sideview";

export const GLOBAL_KEYBOARD_HANDLER = {
    isInited: false,
    prevCode: null,
    prevRepeatCode: null,
    isNewKeyLongPressed: null,
    lastPressedTime: 0,
    getExt(e, up){
        // 提供参数
        const code = e.code;
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey || e.metaKey;
        const alt = e.altKey;
        if(up){
            return {
                code,
                shift,
                ctrl,
                alt
            }
        }

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
        if(this.isInited && !$normal.inputModeEntry){
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
            // 不处理ctrl shift alt
            if(ext.code === 'ControlLeft' || ext.code === 'ShiftLeft' || ext.code === 'AltLeft'
                || ext.code === 'ControlRight' || ext.code === 'ShiftRight' || ext.code === 'AltRight') {
                return;
            }
            // 快捷键界面场景
            if($reactive.common.shortcutActive){
                K_SHORTCUT_DOWN(ext) && e.preventDefault();
                return;
            }

            // 设置界面
            if($reactive.main.settingActive){
                K_SETTING_DOWN(ext) && e.preventDefault();
                return;
            }

            if ($reactive.currentMode === LIST_VIEW) {
                // LIST_VIEW场景
                K_LISTVIEW_DOWN(ext) && e.preventDefault();
            } else {
                // CODE_VIEW场景
                K_CODEVIEW_DOWN(ext) && e.preventDefault();
            }
        }

        document.onkeyup = e => {
            if ($reactive.utools.vimDisabled || $reactive.main.settingActive || $reactive.utools.focused || $reactive.currentMode >= EDIT_VIEW) {
                return;
            }
            // 需要输入的场景被禁用
            if($reactive.common.variableActive || $reactive.main.tagColorActive){
                return;
            }
            const ext = this.getExt(e,true);
            // 快捷键界面场景
            if($reactive.common.shortcutActive){
                return;
            }
            if($reactive.currentMode === LIST_VIEW){
                K_LISTVIEW_UP(ext) && e.preventDefault();
            }else{
                K_CODEVIEW_UP(ext) && e.preventDefault();
            }
        }
        this.isInited = true
        $normal.inputModeEntry = false;


    },

}