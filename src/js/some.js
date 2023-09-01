export const backupFilePath = utools.getPath('home')+(utools.isWindows()? "\\":'/') +'code-snippet-backup.md';

export const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';

export const defaultHelpSnippet = {
    version: 'v2.3.1',
    name: '🎉入门手册&新功能介绍🎉',
    desc: '右键该元素选择预览代码，懂的人已经用v打开了',
    type: 'markdown',
    code: window.preload?.readREADME_MD(),
    help: true,
    sections: [
        [20,31]
    ]
}
