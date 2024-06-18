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
    // 是否为图片
    image?: boolean,
    // 图片url
    imgId?: string,
    // 是否为(普通)目录
    dir?: boolean,
    // ================================================
    // 代码片段描述部分
    desc?: string,
    // 标签
    tags?: string[],
    // 代码片段 语言类型
    type?: string,
    // 特殊类型,为空时即为code
    category?: "link" | "img" | "dir" | "code",


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
    id?: string,
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
    nativeId?: string
    // TODO: desc 作为MD渲染
    descAsMd?: boolean
    // 匹配类型 0-none 1-描述匹配 2-代码匹配
    matchType?: 0 | 1 | 2
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
    default?: boolean,
    // 排序号
    sort?: number
}
interface BaseExt {
    /**
     * 等同于 e.code
     */
    code: string,
    /**
     * 等同于 e.ctrlKey || e.metaKey
     */
    ctrl: boolean,
    /**
     * 等同于 e.altKey
     */
    alt: boolean,
    /**
     * 等同于 e.shiftKey
     */
    shift: boolean
}

interface Ext extends BaseExt {
    /**
     * 连按两次按键
     */
    double: boolean,
    /**
     * 与 repeat 稍有不同，long只会触发一次
     */
    long: boolean,
    /**
     * 等同于 e.repeat
     */
    repeat: boolean
}

/**
 * 键盘快捷键处理
 * @return 根直属：是否阻止默认行为； 子级：是否阻止后续匹配
 */
declare type KeyDownHandler = (ext: Ext)=> boolean | void
declare type KeyUpHandler = (ext: BaseExt)=> boolean | void


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
    createOrEdit?: (prefix: CodeSnippet[], snippet: CodeSnippet, oldName?: string,ext: any) => Promise<void> | void;
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
declare type ConfPath = undefined

declare type ConfigItem =
      "strategy_theme"                           // 主题
    | "strategy_sort"                            // 排序策略： 0-创建时间  1-最近使用时间 2-累计使用次数 3-自然排序
    | "strategy_item_code_show"                  // 元素代码块显示策略 0-无 1-单行 2-多行
// @deprecated    | "strategy_item_code_raw"                   // 元素代码块不高亮显示
    | "default_tab"                              // 编辑界面Tab键行为： 0-原生 1-\t 2-2个空格 4-4个空格
    | "default_language"                         // 默认语言
    | "default_keyword_enable"                       // 默认是否启用uTools关键字
    | "enable_vim_when_entry"               // 进入插件时是否直接切换到vim模式
// @deprecated    | "beta_tag_aid_choose"                      // 标签辅助选择
// @default    | "beta_wide_snippet_search"                 // 允许扩充搜索范围
    | "beta_wide_desc_close"                     // 关闭描述匹配
    | "beta_wide_content_close"                  // 关闭内容匹配
    | "beta_sub_snippet_search"                  // 允许搜索子代码片段
    | "beta_special_tag"                         // 特殊标签
    | "beta_content_search"                      // 允许搜索内容
    | "version"                                  // 插件版本
    | "lite"                                     // 列表UI模式
    | "readme_close"                             // 说明文档显示
    | "pure_mode"                                // 纯净模式
// @deprecated | "easter_egg_log"                           // 彩蛋：日志

type CopyOrPasteCommand = "copy" | "paste" | "typing"

interface CodeEditorSource {
    readonly content: string,
    readonly cursorStart: number,
    readonly cursorEnd: number
}
interface CodeEditorChange {
    readonly newCursorPosition?: number,
    readonly newCursorPositionEnd?: number,
    readonly newContent?: string,
    readonly changeType: "none" | "cursor" | "content" | "all"
}
type CodeEditorKeyDownHandler = (e: KeyboardEvent, source: CodeEditorSource) => CodeEditorChange | null | undefined
interface ParseResult{
    // 存放无法解析的内容
    code?: string,
    // 对应@variable
    variable?: string,
    // 对应占位符
    command?: string,
    // 可选参数
    param?: string,
    // 对应接收变量
    _var?: string,
    // command对应key
    key?: string,
    // 是否#开头
    assign?: boolean,
    // 链式 占位符
    chain?: ParseResult[],
    // command类型
    flag?: number
}
interface FormatResult{
    type: "input" | "entry" | "code",
    variable?: string,
    defaultValue?: string,
    code?: string,
    msg?: string
}
interface HierarchyHub{
    /**
     * 置顶列表
     */
    topList?: string[],
    /**
     * 回收站，记录 过期时间 - keyword
     */
    recycleBin?: {
        [key: string]: {
            expired: number,
            keyword?: boolean
        }
    },
    /**
     * 保存代码片段数据： 使用次数、最近使用时间、子代码片段
     */
    snippets?: {
        [key: string]: {
            count?: number,
            time?: number,
            sections?: Array<[number,number]>
        }
    }
}

/**
 * 非响应式全局变量
 */
interface Normal  {
    // TODO id可能有重复的情况
    lastQueryCodeSnippetId: string | null,
    recoverLiteShow: boolean,   // 是否恢复为 列表UI
    recoverLiteHeight: number,      // 恢复为列表UI的高度
    // 主题
    theme: null | {
        globalColor: string,
        highColor: string,
        selectedColor: string
    },
    // 控制滚动
    scroll:{
        // 控制CodeView滚动
        codeHorizontalInvoker: HTMLElement | null, //
        codeVerticalInvoker: HTMLElement | null, //
        sideCodeHorizontalInvoker: HTMLElement | null,  // 控制侧边滚动
        sideCodeVerticalInvoker: HTMLElement | null, //
        itemCodeInvoker: HTMLElement | null,   // 控制多行代码块滚动
        hierarchyInvoker: HTMLElement | null,  // 控制topNav
        virtualInvoker: HTMLElement | null , // 控制 virtual scroll
        helpInvoker: HTMLElement | null,    // 【快捷方式】控制的滚动
        settingInvoker: HTMLElement | null  // 【设置】控制的滚动
    },
    // Vim模式下空格执行的程序
    spaceInvoker: Function[],
    /**
     * 层级路径
     */
    hierarchyPath: {
        local?: boolean,
        value: string,
        index: number
    }[],
    // ------- 控制 选中元素 保持记忆功能 --------
    /**
     * 下面两者都是控制 选中元素 保持记忆功能
     * keepSelectedStatus
     * 控制 $index是否维持原值,同时滚动至原地点；
     * 当utools搜索变更、创建新元素、以及某元素已改名时为false，即不保持记忆，此时$index = 0,滚动至开头
     *
     * rollbackToOriginWhenRefresh
     * 解决上面滚动至原地点时遇到列表后四个元素时，滚动错位问题，为了解决直接滚动到底部；
     * 滚动到底部是在doScrollForListView中实现，为了避免正常vim上下操作滚动，rollbackToOriginWhenRefresh只有在主动刷新场景下为true
     */
    keepSelectedStatus: boolean,
    rollbackToOriginWhenRefresh: boolean,
    // ----------------------------------------

    // utools快速记录的代码
    quickCode: string | null,
    // 非核心Command进入插件
    entry: boolean,
    // mainPush进入
    mainPush: boolean,
    // input模式
    inputModeEntry: boolean,
    // 占位符相关
    funcs:{
        // 【变量输入】界面遇到select直接使用vim键
        vimSupport: boolean,
        // 【变量输入】的变量集合
        variables: Record<string, "input" | "select" | "password" | "path">,
        // 上述输入变量的默认值
        defaultValues: Record<string, string | null>,
        // 同步codeTemplate数据
        syncDataFunc: Function | null,
        // 当前代码片段名
        snippetName: string | number,
        // 是否粘贴
        copyOrPasteCommand: CopyOrPasteCommand,
        // 消息
        msg: string | number,
    },
    // beta测试
    beta:{
        // beta:子代码片段选择的索引位
        subSnippetNum: number | null,
    },
    // md渲染
    md:{
        // 选择要被复制的pre
        pre: HTMLPreElement | null,
        // 对应pre的索引
        index: number |null,
    },
    keyboard:{
        // 长按Tab用来快速预览
        longTabAsQuickView: boolean,
    }
}
// 主界面
type LIST_VIEW = 0;
// 代码预览界面
type CODE_VIEW = 1;
// 编辑界面
type EDIT_VIEW = 2;
// 创建界面
type CREATE_VIEW = 3;
/**
 * 响应式全局变量
 */
interface Reactive {
    // 当前访问过的代码内容（缓存作用）
    currentCode: string | null,
    // 当前页面
    currentMode: LIST_VIEW | CODE_VIEW | EDIT_VIEW | CREATE_VIEW ,
    /**
     * 当前代码片段
     */
    currentSnippet: CodeSnippet | null,
    // 当前层级前缀
    currentPrefix: CodeSnippet[],
    common:{
        // 【快捷方式】界面
        shortcutActive: boolean,
        shortcutTabIndexForCodeView: number,
        // 【变量输入】界面
        variableActive: boolean,
    },
    code: {  // 适用于 CodeView场景
        // 【目录】界面
        tocActive: boolean,
        // 【详细信息】界面
        infoActive: boolean,
        // 是否正在渲染
        isRendering: boolean,
        // 是否处于【纯净模式】
        isPure: boolean,
        // sections是否发生变化
        sectionsChange: boolean,
        // secionts modal
        sectionsChangeModalActive: boolean,
        // sections trigger is listview or formview
        sectionsChangeTriggerIsListView: boolean,
    },
    main:{
        // 【辅助标签选择】界面
        aidTagActive: boolean,
        // tagColor
        tagColorActive: boolean,
        tagSet: Set<string>,
        tagName: string | null,
        selectedTag: string | null,
        // 【设置】界面
        settingActive: boolean,
        // 是否固定按钮
        isButtonFixed: boolean,
        // 是否进行删除
        isDel: boolean,
        // 是否显示鼠标
        isCursorShow: boolean,
        // 搜索结果是否只有一个元素
        isOnlyOneElement: boolean,
        // 是否处于【完整UI】
        isFullScreenShow: boolean,
        // 用来进行重度刷新
        deepRefresh: boolean,
        // 是否显示【侧边CodeView】
        isSideCodeViewShow: boolean,
        // 是否处于 回收站模式下
        isRecycleBinActive: boolean,
        // 回收冲突模式
        isRecycleConflict: boolean,
    },
    form:{
        fullScreen: boolean,
    },
    setting:{
        // 【占位符编辑】界面
        funcEditActive: boolean,
        // 特殊标签配置 界面
        specialTagConfigActive: boolean,
    },
    // 插件应用重启
    appRestart: boolean,
    // 控制utool及Vim模式
    utools:{
        // utools输入框是否聚焦
        focused: boolean,
        // utools输入框内容
        search: string | null,
        // 控制按键
        vimDisabled: boolean,
        // 用来进行轻度刷新
        searchRefreshValue: number,
        // 选择元素子索引，控制右键菜单（Vim模式）
        subItemSelectedIndex: -1 | 0 | 1 | 2 | 3 | 4,
    }
}