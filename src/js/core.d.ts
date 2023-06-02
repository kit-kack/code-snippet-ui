export declare interface CodeSnippet{
    // 代码片段名，唯一
    name: string,
    // 代码片段内容
    code: string,
    // 代码片段描述部分
    desc: string | undefined,
    // 上次访问代码片段时间, 使用时间戳表示
    time: number | undefined,
    // 代码片段粘贴使用次数
    count: number | undefined,
    // 标签
    tags: Array<string> | undefined,
    // 代码片段 语言类型
    type: string | undefined,
    // 高级查询词，存储来提升查询效率
    query: string | undefined
}

export declare type ConfigItem =
    "showTimeTag"                                    // 是否展示 内置时间标签
    | "showCountTag"                                 // 是否展示 内置计数标签
    | "showLanguageTag"                              // 是否展示 内置类型标签
    | "enabledVim"                                   // 是否启用Vim默认
    | "defaultColor"                                 // 给定 自定义标签颜色
    | "darkGlobalColor" | "lightGlobalColor"         // 全局颜色 （依据平台暗黑模式而定）
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
    | "noShowForEmptySearch"                         // 对于空的搜索词，是否显示所有数据