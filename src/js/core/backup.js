import JSZip from "jszip";
import {tagColorManager} from "./tag";
import {formatManager} from "./func";
import {codeSnippetManager} from "./snippet";
import {hierachyHubManager} from "./hub";



/**
 * backup.zip目录结构：
 * - code-snippet-tag.json
 * - code-snippet-func.json
 * - code
 * - code/custom
 * - hub
 * - func
 */
/**
 * 数据导出
 * @param path
 */
export function generate_backup(path){
    const zip = new JSZip();
    const docs = utools.db.allDocs();

    // tag
    tagColorManager.backup(zip,"code-snippet-tag.json")
    // func
    formatManager.backup(zip,"code-snippet-func.json","func")
    // 这里为了简化，强制导出数据snippet
    codeSnippetManager.backup(zip,"code")
    // hub
    hierachyHubManager.backup(zip,"hub")
    // generate zip
    window.preload.generateZip(zip,path);
}

/**
 * 强制覆盖uTools数据库中的数据
 * @param path
 * @return {Promise<void>}
 */
export async function load_backup(path){
    const zip = await JSZip.loadAsync(window.preload.readFile(path));
    // tag
    await tagColorManager.load(zip, "code-snippet-tag.json")
    // func
    await formatManager.load(zip, "code-snippet-func.json","func")
    // hub
    await hierachyHubManager.load(zip, "hub")
    // snippet
    await codeSnippetManager.load(zip, "code")

    // exit,refresh
    $dialog.info({
        title: "提示",
        content: "备份导入完成，插件即将退出，请您重新打开插件",
        closable: false,
        positiveText: "确定退出插件",
        maskClosable: false,
        onPositiveClick:()=>{
            utools.outPlugin();
        }
    })
}