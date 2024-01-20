declare interface Window{
    preload?: typeof import('./preload/index')
}
declare interface CodeSnippetCore{
    // 代码片段名，请在你所在的目录中保证唯一性
    name: string,

    // ===============================================
    // 下面属性必须至少设置一个，属性设置优先级： dir（普通目录) > code(普通代码片段) > path(关联文件)
    // 代码片段内容
    code?: string,
    // 路径 (本地 或者 网络)，设置该属性后该代码片段将成为 关联文件
    path?: string,
    link?: boolean,  // 对应设置path项而言，是否为单纯的链接导向，而无法查看内容
    // 是否为(普通)目录
    dir?: boolean,
    // ================================================
    // 代码片段描述部分
    desc?: string,
    // 标签
    tags?: string[],
    // 代码片段 语言类型
    type?: string,


    //  如果你不使用内置排序策略，其实没必要设置下面这些属性
    // 上次访问代码片段时间, 使用时间戳表示
    time?: number,
    // 创建时间
    createTime?: number,
    // 代码片段粘贴使用次数
    count?: number,
}
declare interface CodeSnippet extends CodeSnippetCore{
    // nanoid：表示唯一
    id?: number | string,
    // 是否注册为内置keyword
    keyword?: boolean,
    // 是否为内置说明文档，无法修改使用
    help?: boolean
    // 是否为本地
    // local?: boolean,
    // 目录类型或代码引用
    ref?: "local" | "vscode" | "custom";
    // 高亮行
    sections?: Array<[number,number]>,
    // now: 主动用于避免搜索数据重复使用
    now?: number
    // 高亮匹配
    temp?: string,
    editor: {
        vscode: boolean,
        sublime_text: boolean,
        idea: boolean
    },
    nativeId?: string
    // TODO: desc 作为MD渲染
    descAsMd?: boolean
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
    // 是否可编辑
    edit ?: boolean,
    // 是否可创建
    create ?: boolean,
    // 是否可删除
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
            "desc"?: boolean,
        },
    },
    /**
     * 预置格式化占位符
     */
    funcs?: Record<string, (param) => any>
}
declare type SearchResult = CodeSnippet[] | {
    /**
     * 是否已经被排序；若未被排序，将会采用插件内置排序策略进行排序
     */
    sorted: boolean,
    /**
     * 是否已经被高亮匹配；若未被高亮匹配，将会采用插件内置搜索高亮
     */
    highlighted: boolean,
    /**
     * 是否未进行依据搜索词进行过滤；若为true，则使用插件内置搜索过滤策略
     */
    unfiltered: boolean,
    /**
     * 代码片段结果集
     */
    snippets: CodeSnippet[]
}
declare interface HierarchyCore{
    conf?: {
        [key: string]:{
            name: string,
            value?: string | string[]
        }
    },

    /**
     * 关联目录初始化,抛出异常则初始化失败
     */
    init?: (conf: {
        [key in keyof typeof this.conf & string]: string
    })=> void | never,
    /**
     * 查询代码片段
     * @param prefix 当前目录层级前缀
     * @param search 处理过的搜索词
     * @param ext
     * @return
     */
    search(prefix:CodeSnippet[],search: string | null,ext: any): SearchResult  | Promise<SearchResult>,
    /**
     * 判断代码片段名是否重复
     */
    checkNameRepeat?: (prefix: CodeSnippet[], name: string) => boolean;
    /**
     * 新增或修改 代码片段
     * （当oldName不为空时为修改操作，否则为新增操作）
     * @param {string[] | null} prefix 前缀
     * @param {CodeSnippet} snippet 代码片段
     * @param {string} oldName 如果不为空则为修改操作，否则为新增操作
     */
    createOrEdit?: (prefix: CodeSnippet[], snippet: CodeSnippet, oldName?: string,ext: any) => void;
    /**
     * 删除代码片段
     * @param {string} name
     */
    remove?: (prefix:CodeSnippet[],snippet: CodeSnippet) => void;
    /**
     * 获取配置
     */
    getConfig?: (prefix:CodeSnippet[]) => HierarchyConfig;
    /**
     * 解析数据
     */
    resolveUrl?: (url: string,type: string) => Promise<string>;
}
// 基本定义
declare interface Hierarchy extends HierarchyCore{
    /**
     * 是否为内置核心；该属性不暴露设置
     */
    core?: boolean,
    inline?: boolean,
}
declare interface Editor{
    /**
     * 写入代码片段
     * @param {string} name 代码片段名，一般为缩写
     * @param {string} code 代码片段内容
     * @param {string} desc 描述
     * @param {string} dir 存放目录
     */
    update(dir: string ,name: string,code: string,desc?: string),

    /**
     * 移除代码片段
     * @param {string} name 代码片段名，一般为缩写
     * @param {string} dir 存放目录
     */
    remove(dir: string,name: string)
}
declare type ConfPath =
    "editor"

declare type ConfigItem =
      "strategy_theme"                           // 主题
    | "strategy_sort"                            // 排序策略： 0-创建时间  1-最近使用时间 2-累计使用次数 3-自然排序
    | "strategy_item_code_show"                  // 元素代码块显示策略 0-无 1-单行 2-多行
    | "strategy_item_code_raw"                   // 元素代码块不高亮显示
    | "default_tab"                              // 编辑界面Tab键行为： 0-原生 1-\t 2-2个空格 4-4个空格
    | "default_language"                         // 默认语言
    | "default_keyword_enable"                       // 默认是否启用uTools关键字
    | "beta_tag_aid_choose"                      // 标签辅助选择
    | "beta_sub_snippet_search"                  // 允许搜索子代码片段
    | "beta_special_tag"                         // 特殊标签
    | "beta_content_search"                      // 允许搜索内容
    | "version"                                  // 插件版本
    | "lite"                                     // 列表UI模式
    | "readme_close"                             // 说明文档显示
    | "pure_mode"                                // 纯净模式
