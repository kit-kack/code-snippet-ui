/**
 *
 * @type Editor
 */
export const SUBLIME_TEXT_EDITOR = {

    update(dir,name,code,desc){
        const content = `\
<snippet>
    <content><![CDATA[
${code.replaceAll(']]>',']]$NOT_DEFINED>')}
]]></content>
    <tabTrigger>${name}</tabTrigger>
    <description>${desc?? name}</description>
</snippet>`;
        const configPath = window.preload.getFinalPath(dir,`./utools-code-snippet`);
        const filename =  encodeURI(name) + '.sublime-snippet';
        window.preload.writeConfigFile(configPath,filename,content)
    },
    remove(dir,name) {
        try{
            window.preload.removeFile(window.preload.getFinalPath(dir,`./utools-code-snippet/${encodeURI(name)}.sublime-snippet`));
        }catch (e){
            console.error(e)
        }
    }
}