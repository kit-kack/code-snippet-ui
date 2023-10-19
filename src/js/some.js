export const backupFilePath = utools.getPath('desktop')+(utools.isWindows()? "\\":'/') +'code-snippet-backup.zip';
export const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';


export const defaultHelpSnippet = {
    id: 'default',
    version: __APP_VERSION__,
    name: `🎉入门手册&新版本说明🎉`,
    desc: '右键该元素选择预览代码，懂的人已经用v打开了',
    type: 'markdown',
    code: window.preload?.readREADME_MD(),
    help: true,
    sections: [
        [101,108]
    ],
    tags: ["v"+__APP_VERSION__]
}
