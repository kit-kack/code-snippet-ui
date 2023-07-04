import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from "highlight.js";
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import createTodoListPlugin from '@kangc/v-md-editor/lib/plugins/todo-list/index';
import '@kangc/v-md-editor/lib/plugins/todo-list/todo-list.css';

// highlight
hljs.registerAliases(["vue","html"],{languageName:"xml"})

VMdPreview.use(githubTheme,{
    Hljs: hljs
})
VMdPreview.use(createTodoListPlugin())

export default function  initVH(app){
    app.use(hljsVuePlugin)
    app.use(VMdPreview)
}