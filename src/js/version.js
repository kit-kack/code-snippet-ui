const tab = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• '
const content=[
    '1. 类型为markdown的代码片段可以被渲染显示，',
    `${tab}Vim键为R键（移除旧作用）`,
    '2. 支持本地/网络代码片段，请在创建代码界面选择 链接文件',
    '3. 代码预览界面提供 高亮行操作（视作为子代码片段）',
    `${tab}在Vim模式下支持快捷粘贴复制（alt/shift + num）；`,
    `${tab}左击行号---单行选择，右击行号---范围选择`,
    '4. 内置标签与自定义标签 现不支持调整位置'
]
export default {
    version: 'v2.2.4',
    content: content
}