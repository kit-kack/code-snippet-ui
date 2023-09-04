export const backupFilePath = utools.getPath('home')+(utools.isWindows()? "\\":'/') +'code-snippet-backup.md';
export const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';

let logCount = 0;
const logFilePath = utools.getPath('temp')+(utools.isWindows()? "\\":'/') +'code-snippet-log.txt';
export function log(msg){
    logCount++;
    if(logCount === 1000){
        logCount = 0
    }
    window.preload.writeConfig(logFilePath,msg,logCount===0)
}

export const defaultHelpSnippet = {
    id: 'default',
    version: 'v2.3.1',
    name: '🎉入门手册&新功能介绍🎉',
    desc: '右键该元素选择预览代码，懂的人已经用v打开了',
    type: 'markdown',
    code: window.preload?.readREADME_MD(),
    help: true,
    sections: [
        [78,88]
    ]
}
