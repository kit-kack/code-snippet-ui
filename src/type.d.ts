declare interface Window{
    preload?: typeof import('./preload/index')
}
declare interface CodeSnippetCore{
    // 代码片段名，后续不一定唯一
    name: string,
    // 代码片段内容
    code: string,
    // 代码片段描述部分
    desc?: string,
    // 上次访问代码片段时间, 使用时间戳表示
    time?: number,
    // 创建时间
    createTime?: number,
    // 代码片段粘贴使用次数
    count?: number,
    // 标签
    tags?: string[],
    // 代码片段 语言类型
    type?: string,
    // 路径 (本地 或者 网络)
    path?: string,
    // 是否为目录
    dir?: boolean,
    // link 重载说明信息
    link_desc?: string,
}
declare interface CodeSnippet extends CodeSnippetCore{
    // nanoid：表示唯一
    id?: string,
    // 是否为功能关键字
    feature?: boolean
    /**
     * 高级查询词，存储来提升查询效率
     * @deprecated - 模糊符号匹配改进为 进阶符号匹配，后续版本会删除
     */
    query?: string,
    // 是否为内置说明文档，无法修改使用
    help?: boolean
    // 是否为本地
    // local?: boolean,
    // 目录类型或代码引用
    ref?: "local" | "vscode" | string;
    // 高亮行
    sections?: Array<[number,number]>,
    // 前缀
    prefix?: string
}

declare interface Func {
    // 唯一标识
    name: string,
    // 描述
    desc?: string
    // 匹配名字
    commands: string[],
    // 表达式
    expression: string,
    // 内置
    default?: boolean
}


declare interface HierarchyConfig{
    // 基本功能
    edit ?: boolean,
    create ?: boolean,
    remove ?: boolean

    // 编辑界面相关配置
    form:{
        /**
         * 代码片段内容来源：“代码输入” 和 “关联”
         */
        codeSource: "all" | "code" | "link";
        /**
         * 允许的关联类型：“文件” 和 “目录”
         */
        linkType?: "all" | "file" | "dir";

        /**
         * placeholders
         */
        placeholders?:{
            name?: string,
            desc?: string,
            tags?: string,
            code?: string,
        }
        allowUpdatedProperties:{
            "name"?: boolean,
            "code"?: boolean,
            "tags"?: boolean,
            "type"?: boolean,
            // 设置为 uTools关键字
            "feature"?: boolean,
            "desc"?: boolean,
        },
    },
}
declare interface SearchResult{
    /**
     * 是否已经被排序
     */
    sorted: boolean,
    /**
     * 是否已经高亮匹配
     */
    highlighted: boolean,
    /**
     * 代码片段
     */
    snippets: CodeSnippet[]
}
// 基本定义
declare interface Hierarchy{
    /**
     * 是否为内置核心；该属性不暴露设置
     */
    core?: boolean,
    inline?: boolean,
    /**
     * 查询代码片段
     * @param {string | null} name 名称
     * @param prefix
     * @return {CodeSnippet[]}
     */
    search(prefix:string[] | null,name: string | null): SearchResult | Promise<SearchResult>,
    /**
     * 判断代码片段名是否重复
     */
    checkNameRepeat?: (prefix: string[] | null, name: string) => boolean;
    /**
     * 新增或修改 代码片段
     * @param {string[] | null} prefix 前缀
     * @param {CodeSnippet} snippet 代码片段
     * @param {string} oldName 如果不为空则为修改操作，否则为新增操作
     */
    createOrEdit: (prefix: string[] | null, snippet: CodeSnippet, oldName?: string) => void;
    /**
     * 删除代码片段
     * @param {string} name
     */
    remove?: (prefix:string[] | null,snippet: CodeSnippet) => void;
    /**
     * 获取配置
     */
    getConfig?: (prefix:string[] | null) => HierarchyConfig;
}

declare type ConfigItem =
// @deprecated:默认行为     "showTimeTag"                                    // 是否展示 内置时间标签
// @deprecated:默认行为     | "showCountTag"                                 // 是否展示 内置计数标签
// @deprecated:默认行为     | "showLanguageTag"                              // 是否展示 内置类型标签
// @deprecated:默认行为     | "showOriginTag"                                // 是否展示 来源类型（普通、本地文件、网络文件)标签
// @deprecated:默认行为     | "enabledAutoVim"        // 点击元素是否自动进入Vim模式
    | "darkTagColor" | "lightTagColor"               // 给定 自定义标签颜色
    | "darkGlobalColor" | "lightGlobalColor"         // 全局颜色 （依据平台暗黑模式而定）
    | "darkSelectedColor" | "lightSelectedColor"     // 被选中元素 背景颜色
    | "darkHighlightColor" | "lightHighlightColor"   // 代码高亮行颜色
    | "sortKey"                                      // 排序策略： 0-创建时间  1-最近使用时间 2-累计使用次数 3-自然排序
// @deprecated:默认行为     | "shiftTagPosition"                             // 内置标签 位置切换
// @deprecated:默认行为     | "showTagIcon"                                  // 内置标签 显示图标策略： true则使用图标，否则使用颜色
    | "whatTabDo"                       // 在CREATE/UPDATE VIEW中代码输入框监听Tab键的行为， 0-原生 1-\t 2-2个空格 4-4个空格
// @deprecated:默认行为    | "doubleClickPaste"       // 双击元素 来粘贴代码片段
// @deprecated:默认行为    | "enabledBeep"            // 是否启用Beep声
// @deprecated:被废弃    | "exitAfterPaste"          // 粘贴后退出插件
// @deprecated:默认行为    | "enabledFuzzySymbolQuery"                      //模糊符号查询
    | "topList"                                      //置顶列表
    | "rawLineCode"                                  // 原始行内代码，不进行高亮
    | "enabledLiteShow"                              // 支持无UI模式下的显示效果
// @deprecated:暂时移除    | "noShowForEmptySearch"                         // 对于空的搜索词，是否不显示（所有）数据
    | "fullItemCodeShow"                             // 展示元素 代码块
    | "noItemCodeShow"                               // 不展示 元素代码块
    | "version"                                      // 插件版本，用来判断是否为最新版本
// @deprecated:暂时移除     | "forbidMouseHover"                             // 禁用鼠标滑过
    | "colorSchema" | "darkColorSchema"              // 颜色方案
// @deprecated:暂时移除     | "renderApi"                                   // 可选渲染选项
    | "defaultLanguage"                             // 默认选择语言
    | "defaultUtoolFeatureEnable"                   // 默认是否注册uTools关键字
// @deprecated:暂时移除     | "autoBackup"                                  // 自动备份
    | "lastAutoBackupTime"                          // 上次自动备份时间
    | "closeHelpSnippet"                            // 关闭defaultHelpSnippet
    | "aidTagSelect"                               // 标签辅助选择
// @deprecated:待考虑    | "allowTest"                                  // 测试版尝鲜
    | "allowSearchSubSnippet"                        // 允许搜索子代码片段