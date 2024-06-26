<template>
  <div
      class="code-editor hide-header"
      :class="{
      scroll: scroll,
      'read-only': readOnly,
      wrap: wrap,
    }"
      :style="{
      width: width,
      height: height,
      zIndex: zIndex,
      maxWidth: maxWidth,
      minWidth: minWidth,
      maxHeight: maxHeight,
      minHeight: minHeight,
    }"
  >
    <div class="hljs">
      <div
          class="code-area"
      >
        <div
            v-if="showLineNums"
            ref="lineNums"
            class="line-nums hljs"
            :style="{
            fontSize: fontSize,
            paddingTop: padding,
            paddingBottom: padding,
            top: top + 'px',
          }"
        >
          <div>1</div>
          <div v-for="num in lineNum">{{ num + 1 }}</div>
        </div>
        <textarea
            :readOnly="readOnly"
            :style="{
            fontSize: fontSize,
            padding: '5px 10px 10px 10px',
            marginLeft: showLineNums ? lineNumsWidth + 'px' : '0',
            width: showLineNums ? 'calc(100% - ' + lineNumsWidth + 'px)' : '100%',
          }"
            ref="textarea"
            spellcheck="false"
            @keydown="handleNewKeyDown"
            @scroll="calcScrollDistance"
            :value="modelValue == undefined ? content : modelValue"
            :placeholder="placeholder"
            @dragenter="handleDragStart"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
            @input="updateValue"
        ></textarea>
        <pre
            :style="{
            paddingRight: scrollBarWidth + 'px',
            paddingBottom: scrollBarHeight + 'px',
            marginLeft: showLineNums ? lineNumsWidth + 'px' : '0',
            width: showLineNums ? 'calc(100% - ' + lineNumsWidth + 'px)' : '100%',
          }"
        >
        <code
            ref="code"
            v-highlight="contentValue"
            :class="languageClass"
            :style="{
            top: top + 'px',
            left: left + 'px',
            fontSize: fontSize,
            padding: '5px 10px 10px 10px'
          }">
        </code>
      </pre>
      </div>
    </div>
  </div>
</template>

<script>
import hljs from "../../js/dep/highlight-dep";
import {handleCodeEditorKeyDown} from "./key-handler";
import {useHistory} from "./history";

export default {
  name: "CodeEditor",
  props: {
    lineNums: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: String,
    },
    value: {
      type: String,
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "auto",
    },
    maxWidth: {
      type: String,
    },
    minWidth: {
      type: String,
    },
    maxHeight: {
      type: String,
    },
    minHeight: {
      type: String,
    },
    borderRadius: {
      type: String,
      default: "12px",
    },
    placeholder: {
      type: String,
      default: "记录你的每一次奇思妙想✨"
    },
    languages: {
      type: Array,
      default: function () {
        return [["javascript", "JS"]];
      },
    },
    zIndex: {
      type: String,
      default: "0",
    },
    fontSize: {
      type: String,
      default: "14px",
    },
    padding: {
      type: String,
      default: "5px",
    },
    historyKey: {
      type: String
    }
  },
  directives: {
    highlight: {
      mounted(el, binding) {
        el.textContent = binding.value;
        hljs.highlightElement(el);
      },
      updated(el, binding) {
        if (el.scrolling) {
          el.scrolling = false;
        } else {
          el.textContent = binding.value;
          hljs.highlightElement(el);
        }
      },
    },
  },
  data() {
    const {undo,redo,record} = useHistory((change)=>{
      if(change){
        const isContentUpdate = change.changeType === 'all' || change.changeType === 'content';
        const isCursorUpdate = change.changeType === 'all' || change.changeType === 'cursor';
        if(isContentUpdate){
          this.triggerCursor(change,false);
          this.$emit("update:modelValue",change.newContent)
        }else if(isCursorUpdate){
          this.triggerCursor(change,true);
        }
      }
    },(this.modelValue ?? this.content) + "",this.historyKey);
    this.undo = undo
    this.redo = redo
    this.record = record
    return {
      scrollBarWidth: 0,
      scrollBarHeight: 0,
      top: 0,
      left: 0,
      languageClass: "hljs language-" + this.languages[0][0],
      languageTitle: this.languages[0][1] ? this.languages[0][1] : this.languages[0][0],
      content: this.value,
      cursorPosition: 0,
      cursorPositionEnd: 0,
      cursorMode: null,
      lineNum: 0,
      lineNumsWidth: 0,
      scrolling: false,
      textareaHeight: 0,
      showLineNums: this.wrap ? false : this.lineNums,
      dragTrigger: false
    };
  },
  computed: {
    contentValue() {
      return this.modelValue == undefined ? this.content + "\n" : this.modelValue + "\n";
    },
    scroll() {
      return this.height == "auto" ? false : true;
    },
  },
  methods: {
    /**
     * @param {DragEvent} e
     */
    handleDragStart(e) {
      const items = e.dataTransfer.items;
      if(items && items.length > 0){
        for (let item of items) {
          if(item.kind === "file" && item.type.startsWith('image/')){
            e.preventDefault();
            this.dragTrigger = true
            this.$emit('img-drag-trigger',true)
            return;
          }
        }
      }
    },
    handleDragLeave(e){
      if(this.dragTrigger){
        this.dragTrigger = false
        this.$emit('img-drag-trigger',false)
      }
    },
    /**
     *
     * @param {DragEvent} e
     */
    handleDragOver(e) {
      if(this.dragTrigger){
        e.preventDefault();
      }
    },
    /**
     *
     * @param {DragEvent} e
     */
    handleDrop(e) {
      if(this.dragTrigger){
        this.dragTrigger = false
        this.$emit('img-drag-trigger',false)
        const items = e.dataTransfer.items;
        if(items && items.length > 0){
          for (let item of items) {
            if(item.kind === "file" && item.type.startsWith('image/')){
              this.$emit('img-drop',item);
              return;
            }
          }
        }
      }
    },
    insertCommand(command){
      const cursorPosition = this.$refs.textarea.selectionStart;
      const newContent = this.modelValue.slice(0,cursorPosition) + command + this.modelValue.slice(cursorPosition);
      /**
      * @type CodeEditorChange
      */
      const change = {
        changeType: "all",
        newContent: newContent,
        newCursorPosition: cursorPosition + command.length
      }
      this.triggerCursor(change,false);
      this.$emit("update:modelValue",newContent)
      this.record(change)
    },
    updateValue(e) {
      if (this.modelValue == undefined) {
        this.content = e.target.value;
      } else {
        this.record({
          changeType: "all",
          newContent: e.target.value,
          newCursorPosition: this.$refs.textarea.selectionStart,
          newCursorPositionEnd: this.$refs.textarea.selectionStart === this.$refs.textarea.selectionEnd ? undefined: this.$refs.textarea.selectionEnd
        })
        this.$emit("update:modelValue", e.target.value);
      }
    },
    changeLang(lang) {
      this.languageTitle = lang[1] ? lang[1] : lang[0];
      this.languageClass = "language-" + lang[0];
      this.$emit("lang", lang[0]);
    },
    calcScrollDistance(e) {
      this.$refs.code.scrolling = true;
      this.scrolling = true;
      this.top = -e.target.scrollTop;
      this.left = -e.target.scrollLeft;
    },
    resizer() {
      // textareaResizer
      const textareaResizer = new ResizeObserver((entries) => {
        this.scrollBarWidth = entries[0].target.offsetWidth - entries[0].target.clientWidth;
        this.scrollBarHeight = entries[0].target.offsetHeight - entries[0].target.clientHeight;
        this.textareaHeight = entries[0].target.offsetHeight;
      });
      textareaResizer.observe(this.$refs.textarea);
      // lineNumsResizer
      const lineNumsResizer = new ResizeObserver((entries) => {
        this.lineNumsWidth = entries[0].target.offsetWidth;
      });
      if (this.$refs.lineNums) {
        lineNumsResizer.observe(this.$refs.lineNums);
      }
    },
    getLineNum() {
      // lineNum
      const str = this.$refs.textarea.value;
      let lineNum = 0;
      let position = str.indexOf("\n");
      while (position !== -1) {
        lineNum++;
        position = str.indexOf("\n", position + 1);
      }
      // displayed lineNum
      this.lineNum = lineNum;
    },
    /**
     * 变动光标位置
     * @param {CodeEditorChange} change
     * @param {boolean} manual - 手动触发
     */
    triggerCursor(change,manual){
      this.cursorPosition = change.newCursorPosition;
      if(change.newCursorPositionEnd){
        this.cursorPositionEnd = change.newCursorPositionEnd;
        if(manual){
          this.$refs.textarea.setSelectionRange(change.newCursorPosition, change.newCursorPositionEnd);
        }else{
          this.cursorMode = "selection";
        }
      }else{
        if(manual){
          this.$refs.textarea.setSelectionRange(change.newCursorPosition, change.newCursorPosition);
        }else{
          this.cursorMode = "move";
        }
      }
    },
    getNowCursorChange(){
      return {
          newCursorPosition: this.$refs.textarea.selectionStart,
          newCursorPositionEnd: this.$refs.textarea.selectionStart === this.$refs.textarea.selectionEnd ? undefined: this.$refs.textarea.selectionEnd
      }
    },

    handleNewKeyDown(e){
      // 优先处理 ctrl+z ctrl+y
      if(e.ctrlKey || e.metaKey){
        if(e.key === 'z'){
          e.preventDefault();
          this.undo();
        }else if(e.key === 'y'){
          e.preventDefault();
          this.redo();
        }else if(e.key === 'v'){
          // 判断是否存在图片数据
          // const img = window.preload._clipboard.readImage();
          /**
           * @type string[]
           */
          const availableFormats =  window.preload._clipboard.availableFormats();
          if(availableFormats && availableFormats.length > 0){
            for (let format of availableFormats) {
              if(format.startsWith("image/")){
                e.preventDefault();
                const img = window.preload._clipboard.readImage();
                this.$emit("insertImage",img,format)
                return;
              }
            }
          }
        }
      }
      const change = handleCodeEditorKeyDown(e,{
        content: this.modelValue,
        cursorStart: this.$refs.textarea.selectionStart,
        cursorEnd: this.$refs.textarea.selectionEnd
      })
      if(change){
        e.preventDefault();
        const isContentUpdate = change.changeType === 'all' || change.changeType === 'content';
        const isCursorUpdate = change.changeType === 'all' || change.changeType === 'cursor';
        if(isContentUpdate){
          // 这里需要先记录，因为光标变更操作往往不会被记录,这里需要覆盖nowChange
          this.record(change,this.getNowCursorChange())
          this.triggerCursor(change,false);
          this.$emit("update:modelValue",change.newContent)
        }else if(isCursorUpdate){
          // 这里需要先记录，因为光标变更操作往往不会被记录,这里需要覆盖nowChange
          this.record(change,this.getNowCursorChange())
          this.triggerCursor(change,true);
        }
      }
    }
  },
  mounted() {
    this.$emit("lang", this.languages[0][0]);
    this.$emit("content", this.content);
    this.$emit("textarea", this.$refs.textarea);
    this.resizer();
  },
  updated() {
    if(this.cursorMode){
      if(this.cursorMode === "move"){
        this.$refs.textarea.setSelectionRange(this.cursorPosition, this.cursorPosition);
      }else{
        this.$refs.textarea.setSelectionRange(this.cursorPosition, this.cursorPositionEnd);
      }
      this.cursorMode = null;
    }
    if (this.lineNums) {
      if (this.scrolling) {
        this.scrolling = false;
      } else {
        this.getLineNum();
      }
    }
  }
};
</script>

<style>
.code-editor {
  position: relative;
  background: white;
}
#light-app-v5 .code-editor{
  background: transparent;
}
#dark-app #form-view .code-editor{
  background: #303133;
}
#dark-app .code-editor{
  background: #303133;
}
#dark-app .func-edit-tab .code-editor{
  background: #2c2c32;
}

.code-editor > div {
  width: 100%;
  height: 100%;
}


/* code-area */
.code-editor .code-area {
  position: relative;
  z-index: 0;
  text-align: left;
  overflow: hidden;
}
/* font style */
.code-editor .code-area > textarea,
.code-editor .code-area > pre > code,
.code-editor .line-nums > div {
  font-family: Consolas, Monaco, monospace;
  line-height: 1.5;
}
.code-editor .code-area > textarea::placeholder{
  font-family: 'Consolas' !important;
  color: #c9c9c9;
}
#dark-app .code-editor .code-area > textarea::placeholder{
  color: #8b8c8d;
}
.code-editor .code-area > textarea:hover,
.code-editor .code-area > textarea:focus-visible {
  outline: none;
}
.code-editor .code-area > textarea {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-y: hidden;
  box-sizing: border-box;
  caret-color: rgb(127, 127, 127);
  color: transparent;
  white-space: pre;
  word-wrap: normal;
  border: 0;
  width: 100%;
  height: 100%;
  background: none;
  resize: none;
}
.code-editor .code-area > pre {
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  overflow: hidden;
  font-size: 0;
  margin: 0;
}
.code-editor .code-area > pre > code {
  background: none;
  display: block;
  position: relative;
  overflow-x: visible !important;
  border-radius: 0;
  box-sizing: border-box;
  margin: 0;
}
/* wrap code */
.code-editor.wrap .code-area > textarea,
.code-editor.wrap .code-area > pre > code {
  white-space: pre-wrap;
  word-wrap: break-word;
}
/* hide-header */
.code-editor.hide-header.scroll .code-area {
  height: 100%;
}
/* scroll */
.code-editor.scroll .code-area {
  height: calc(100% - 34px);
}
.code-editor.scroll .code-area > textarea {
  overflow: auto;
}
.code-editor.scroll .code-area > pre {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
/* dropdown */
.code-editor .list {
  -webkit-user-select: none;
  user-select: none;
  height: 100%;
  font-family: sans-serif;
}
/* line-nums */
.code-editor .line-nums {
  min-width: 36px;
  text-align: right;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  padding-right: 8px;
  padding-left: 8px;
  opacity: 0.3;
}
.code-editor .line-nums::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-right: 1px solid currentColor;
  opacity: 0.5;
}
</style>
