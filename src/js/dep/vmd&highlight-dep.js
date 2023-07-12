import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from "highlight.js";
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import createTodoListPlugin from '@kangc/v-md-editor/lib/plugins/todo-list/index';
import '@kangc/v-md-editor/lib/plugins/todo-list/todo-list.css';
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/cdn';
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css';
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';
// highlight
hljs.registerAliases(["vue","html"],{languageName:"xml"})

VMdPreview.use(githubTheme,{
    Hljs: hljs
})
VMdPreview.use(createTodoListPlugin())
VMdPreview.use(createMermaidPlugin())
VMdPreview.use(createKatexPlugin())
VMdPreview.use(createCopyCodePlugin())

export default function  initVH(app){
    app.use(hljsVuePlugin)
    app.use(VMdPreview)
}