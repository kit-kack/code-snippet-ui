declare interface Window{
    preload?: typeof import('./preload/index')
}
declare interface CodeSnippet{
    // 代码片段名，唯一
    name: string,
    // 代码片段内容
    code: string,
    // 代码片段描述部分
    desc?: string,
    // 上次访问代码片段时间, 使用时间戳表示
    time?: number,
    // 代码片段粘贴使用次数
    count?: number,
    // 标签
    tags?: Array<string>,
    // 代码片段 语言类型
    type?: string,
    // 高级查询词，存储来提升查询效率
    query?: string,
    // 高亮行
    sections?: Array<[number,number]>,
    // 路径 (本地 或者 网络)
    path?: string,
    // 是否为本地
    local?: boolean
}

declare type ConfigItem =
    "showTimeTag"                                    // 是否展示 内置时间标签
    | "showCountTag"                                 // 是否展示 内置计数标签
    | "showLanguageTag"                              // 是否展示 内置类型标签
    | "showOriginTag"                                // 是否展示 来源类型（普通、本地文件、网络文件)标签
    | "enabledAutoVim"                               // 点击元素是否自动进入Vim模式
    | "darkTagColor" | "lightTagColor"               // 给定 自定义标签颜色
    | "darkGlobalColor" | "lightGlobalColor"         // 全局颜色 （依据平台暗黑模式而定）
    | "darkSelectedColor" | "lightSelectedColor"     // 被选中元素 背景颜色
    | "darkHighlightColor" | "lightHighlightColor"   // 代码高亮行颜色
    | "sortKey"                                      // 排序策略： 0-创建时间  1-最近使用时间 2-累计使用次数 3-自然排序
    | "shiftTagPosition"                             // 内置标签 位置切换
    | "showTagIcon"                                  // 内置标签 显示图标策略： true则使用图标，否则使用颜色
    | "whatTabDo"                       // 在CREATE/UPDATE VIEW中代码输入框监听Tab键的行为， 0-原生 1-\t 2-2个空格 4-4个空格
    | "doubleClickPaste"                             // 双击元素 来粘贴代码片段
    | "enabledBeep"                                  // 是否启用Beep声
    | "exitAfterPaste"                               // 粘贴后退出插件
    | "enabledFuzzySymbolQuery"                      //模糊符号查询
    | "topList"                                      //置顶列表
    | "rawLineCode"                                  // 原始行内代码，不进行高亮
    | "enabledLiteShow"                              // 支持无UI模式下的显示效果
    | "noShowForEmptySearch"                         // 对于空的搜索词，是否不显示（所有）数据
    | "fullItemCodeShow"                             // 展示元素 代码块
    | "noItemCodeShow"                               // 不展示 元素代码块
    | "version"                                      // 插件版本，用来判断是否为最新版本
    | "forbidMouseHover"                             // 禁用鼠标滑过
    | "colorSchema" | "darkColorSchema"              // 颜色方案
    | "renderApi"                                   // 可选渲染选项
    | "defaultLanguage"                             // 默认选择语言
    | "autoBackup"                                  // 自动备份
    | "lastAutoBackupTime"                          // 上次自动备份时间