// 备份文件地址
export const backupFilePath = utools.getPath('desktop')+(utools.isWindows()? "\\":'/') +'code-snippet-backup.zip';
// 本地配置目录
export const localConfigDirPath = window.preload.getFinalPath(utools.getPath('appData'),'./code-snippet-utools')
// CTRL键
export const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';


export const defaultHelpSnippet = {
    id: 'default',
    index:0,
    now: Date.now(),
    version: __APP_VERSION__,
    name: `🎉入门手册&新版本说明🎉`,
    desc: '右键该元素选择预览，懂的人已经先用v打开瞅瞅，然后嫌弃性的退出，最后用d移除该文档',
    type: 'markdown',
    code: window.preload?.readREADME_MD(),
    help: true,
    sections: [
        [120,130]
    ],
    tags: ["v"+__APP_VERSION__]
}
