import {VSCODE_EDITOR} from "./vscode";
import {SUBLIME_TEXT_EDITOR} from "./sublime_text";
import {configManager} from "../utools/config";
import {JETBRAINS_EDITOR} from "./jetbrains";

export const VSCode_PATH = window.preload.getFinalPath(utools.getPath('appData'),'./Code/User/snippets');
export const VSCode = "VSCode";
export const SUBLIME_TEXT = "Sublime Text";
export const DEFAULT_CONF = {
    [VSCode]: {
        enabled: true,
        path: VSCode_PATH,
    },
    [SUBLIME_TEXT]: {

    },
    "IDEA": {},
    "PyCharm": {},
    "WebStorm": {},
    "GoLand": {},
    "CLion": {},
    "Android Studio": {},
    "PHPStorm": {}
}
export const SPECIAL_TAG_HANDLER = {
    /**
     * @param {CodeSnippet} snippet
     * @param isEdit
     */
    accept(snippet,isEdit){
        // special type filter
        if(snippet.dir || snippet.path || snippet.link){
            snippet.editor = undefined;
            return
        }
        // special tags
        const conf = configManager.getSubItem('editor') ?? DEFAULT_CONF;
        const editor = {};
        if(isEdit &&snippet.tags){
            snippet.tags.forEach(tag => {
                if(tag in conf){
                    editor[tag] = true
                }
            })
        }

        // compare
        const oldEditor = snippet.editor ?? {};
        for (const key in conf) {
            if(editor[key]){
                // update operator
                if(conf[key].enabled){
                    this.update(conf[key].path,key,snippet)
                }else{
                    delete editor[key]
                }
            }else if(oldEditor[key]){
                // remove operator
                if(conf[key].enabled){
                    this.remove(conf[key].path,key,snippet)
                }
            }
        }

        snippet.editor = editor;

    },

    /**
     * @param {string} tag
     * @param {CodeSnippet} snippet
     * @param {string} dir 存放目录
     */
    remove(dir,tag,snippet){
        if(!dir){
            $message.warning(`[${tag}]路径未填写!!!`)
            return
        }
        if (tag === VSCode){
            VSCODE_EDITOR.remove(dir,snippet.name)
        }else if(tag === SUBLIME_TEXT){
            SUBLIME_TEXT_EDITOR.remove(dir,snippet.name)
        }else{
            JETBRAINS_EDITOR.remove(dir,snippet.name)
        }
    },
    /**
     * @param {string} tag
     * @param {CodeSnippet} snippet
     * @param {string} dir 存放目录
     */
    update(dir,tag,snippet){
        if(!dir){
            $message.warning(`[${tag}]路径未填写!!!`)
            return
        }
        if (tag === VSCode){
            VSCODE_EDITOR.update(dir,snippet.name,snippet.code,snippet.desc)
        }else if(tag === SUBLIME_TEXT){
            SUBLIME_TEXT_EDITOR.update(dir,snippet.name,snippet.code,snippet.desc)
        }else{
            JETBRAINS_EDITOR.update(dir,snippet.name,snippet.code,snippet.desc)
        }
    }
}