declare interface Window{
    preload?: typeof import('./preload/index')
}
declare interface CodeSnippet{
    // nanoid：表示唯一
    id?: string,
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
    tags?: Array<string>,
    // 代码片段 语言类型
    type?: string | HierarchyType,
    /**
     * 高级查询词，存储来提升查询效率
     * @deprecated - 模糊符号匹配改进为 进阶符号匹配，后续版本会删除
     */
    query?: string,
    // 高亮行
    sections?: Array<[number,number]>,
    // 路径 (本地 或者 网络)
    path?: string,
    // 是否为本地
    local?: boolean,
    // 是否为内置说明文档，无法修改使用
    help?: boolean
    // 是否为功能关键字
    feature?: boolean
    // 是否为目录
    dir?: boolean,
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

declare interface Prefix{
    // 唯一标识
    name: string,
    // 路径
    path?: string,
    // 类型
    type?: string
}

// 基本定义
declare interface Hierarchy{
    /**
     * 查询代码片段
     * @param {string | null} name 名称
     * @param {string[] | null} tags 标签数组
     * @param {string | null} type 类型
     * @return {CodeSnippet[]}
     */
    search: (name?: string,tags?: string[],type?: string,prefix?: string[]) => {
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
    },
    form:{
        /**
         * 判断代码片段名是否重复
         */
        containName: (name: string) => boolean;
        /**
         * 创建代码片段
         * @param {CodeSnippet} snippet
         * @return {Boolean} 是否保存配置信息到uTools数据库中
         */
        create?: (snippet: CodeSnippet)=> boolean;
        /**
         * 修改代码片段
         * @param {CodeSnippet} snippet
         * @return {Boolean} 是否保存配置信息到uTools数据库中
         */
        edit?: (snippet: CodeSnippet)=> boolean;
        /**
         * 如果create()和edit()方法逻辑几乎相同，可以不实现create和edit方法，而是实现该方法来共同处理
         */
        createOrEdit?: (snippet: CodeSnippet)=> boolean;
    }

    /**
     * 删除代码片段
     * @param {string} name
     * @return {Boolean} 是否同时删除uTools数据库中的配置信息
     */
    remove?: (name: string) => boolean;
    /**
     * 配置项
     */
    config:{

        /**
         *  限制创建的类型：普通-normal 关联文件-link 普通目录-dir 自定义目录-custom
         */
        limitSourceTypes?: ('normal' |'link' |'dir' |'custom')[],
        /**
         * 限制的代码片段类型(数组表示，默认不限制类型）
         *
         */
        limitSnippetTypes?: string[],
        /**
         * 是否允许设置为uTools关键字
         */
        allowSetAsuToolsKeyword?: boolean,
        // 子目录项配置
        children?: ((prefix: string) => object ) | object;
    }
}
declare type HierarchyType =
    "default"       // 默认类型，可以不填
    | "local_dir"   // 本地目录
    | "vscode"      // VSCode代码片段
    | "maven"       // maven操作方式

declare type ConfigItem =
    "showTimeTag"                                    // 是否展示 内置时间标签
    | "showCountTag"                                 // 是否展示 内置计数标签
    | "showLanguageTag"                              // 是否展示 内置类型标签
    | "showOriginTag"                                // 是否展示 来源类型（普通、本地文件、网络文件)标签
// @deprecated:默认行为     | "enabledAutoVim"        // 点击元素是否自动进入Vim模式
    | "darkTagColor" | "lightTagColor"               // 给定 自定义标签颜色
    | "darkGlobalColor" | "lightGlobalColor"         // 全局颜色 （依据平台暗黑模式而定）
    | "darkSelectedColor" | "lightSelectedColor"     // 被选中元素 背景颜色
    | "darkHighlightColor" | "lightHighlightColor"   // 代码高亮行颜色
    | "sortKey"                                      // 排序策略： 0-创建时间  1-最近使用时间 2-累计使用次数 3-自然排序
    | "shiftTagPosition"                             // 内置标签 位置切换
    | "showTagIcon"                                  // 内置标签 显示图标策略： true则使用图标，否则使用颜色
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
    | "forbidMouseHover"                             // 禁用鼠标滑过
    | "colorSchema" | "darkColorSchema"              // 颜色方案
    | "renderApi"                                   // 可选渲染选项
    | "defaultLanguage"                             // 默认选择语言
    | "defaultUtoolFeatureEnable"                   // 默认是否注册uTools关键字
    | "autoBackup"                                  // 自动备份
    | "lastAutoBackupTime"                          // 上次自动备份时间
    | "closeHelpSnippet"                            // 关闭defaultHelpSnippet
    | "aidTagSelect"                               // 标签辅助选择
// @deprecated:待考虑    | "allowTest"                                  // 测试版尝鲜
    | "allowSearchSubSnippet"                        // 允许搜索子代码片段