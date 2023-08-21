export const backupFilePath = utools.getPath('home')+(utools.isWindows()? "\\":'/') +'code-snippet-backup.md';

export const defaultHelpSnippet = {
    version: 'v2.3.0',
    name: '🎉CodeSnippet插件入门手册&新功能介绍🎉',
    desc: '右键该元素选择预览代码，懂的人已经用v打开了',
    type: 'markdown',
    code: `# 入门手册

> 为了更好地预览，请点击下面的\`未渲染\`切换成\`已渲染\`，又或者\`Vim\`模式下按下\`R\`键

> 想要移除该文档，可以进行删除操作，后续请通过设置界面\`关闭显示入门手册\`恢复即可


## 1.新版本功能
> 新手请先阅读下一章节

1. 支持Markdown文件类型进行渲染显示，支持的文件类型为\`markdown\`和\`md\`
   - Vim模式下，按下\`R\`键（render）进行渲染切换

2. 支持本地关联文件和网络文件，请去\`添加/修改 代码片段\`界面选择\`链接文件\`体验

   - Vim模式下，按下\`B\`键（buffer）可以缓存数据，后续直接访问缓存数据

   > 这里更准确的应该是\`C\`(cache)，不过\`C\`键已有相应功能，故选择\`B\`键

3. 支持子代码片段

   > 这里请先按\`R\`键退出渲染模式，可以发现一些行被高亮覆盖，即子代码片段

   - 点击行号可以添加/取消高亮行覆盖，左键是单行操作，而右键是范围操作
   - 仅支持\`1-9\`个子代码片段，其他子代码片段虽存在但无法如下面使用
   - 子代码片段的使用仅限于\`Vim\`模式场景
     - \`1-9\`键：复制对应子代码片段
     - \`shift/alt/ctrl/command\`+\`1-9\`键：粘贴对应子代码片段

   > 如果子代码片段过多不好清理，请快速点击 代码预览界面的\`Vim\`按钮\`3\`次，即可清除所有子代码片段

4. 支持内置变量和表达式解析

> 当前功能仅适用于\`x-\`开头类型的代码片段，例如\`x-markdown\`等

\`\`\`javascript
// 支持内置变量解析：关于内置变量，可以去 设置>标签与变量 中配置
#{rand10m}#  // #{...}#

// 支持表达式解析，内部必须以@开头
#{@Date.now()}#  // #{@...}#  不支持内置变量解析,但是可以通过$内置变量来获取，例如$.random

// 其中内置变量若被替换为以@开头的表达式，可以继续表达式解析
#{exp}#  // exp变量被配置为 @Date.now()，后续进行 #{@Date.now()}表达式解析
\`\`\`

> 补充说明：配置内置变量时，可以将变量配置为\`#{input:default}#\`，从而在每次粘贴复制时会触发用户主动输入变量值，其中\`:default\`表示默认值，可以进行省略;但是，由于分离出来的窗口丢失原有的窗口信息，导致无法成功粘贴（目前需要手动粘贴），其实嘛就是我作为前端小白，不太会Electron技术啊


5. 原有三个内置标签（时间、类型和使用次数）被移除，转为元素右下角小字显示
6. 更改【快捷方式】显示，请在\`Vim\`模式下按\`Z\`键查看，滚动条也可以被控制
7. 新增【元素代码块】不显示的效果，请在 个性化定制 体验
8. 适配uTools4.0聚合模式，提供快速搜索代码片段并粘贴使用功能





## 2.新手入门

> 在这里很感谢您的使用，由于自己在前端方面仍是一个小白，插件可能会出现一些未知问题，若您遇到了，希望能够反馈

- 关于本插件

本插件是一个管理代码片段的utools插件应用，为了避免一些低效的鼠标操作，本插件更偏向于\`Vim\`模式操作。

> 按下\`Tab\`键可以开启/关闭\`Vim\`模式，在完整UI模式下可以发现左下角有一个\`Vim\`模式显示块

> 本插件更偏向于\`Vim\`键盘操作方式，相对于鼠标操作可能不太友好，你也可以选择官方的\`备忘快贴\`插件应用，没必要一棵树吊死

> 新版本功能：查看Vim模式的按键功能，请在\`Vim\`模式下按下\`Z\`键查看

- UI模式切换

本插件支持下面两种UI模式，可以快速双击\`Tab\`键进行切换\t

1. 完整UI模式：高度始终不变
2. 列表UI模式：主界面随元素数量而改变

> 可以在设置界面中配置 默认UI模式
- 查询代码片段
在utools的子输入框进行输入
\`\`\`js
[name] [#tag] [@type]
// [...]表示可选部分
// name: 代码片段名（模糊匹配）
// tag: 标签，可以指定多个
// type: 代码片段类型
\`\`\`
> 上面的查询中三个部分都是可选的，要以空格间隔，并不限制顺序`,
    help: true,
    sections: [
        [20,31]
    ]
}
