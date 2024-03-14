<template>
  <div
      class="code-editor"
      :class="{
      'hide-header': !header,
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
            :autofocus="autofocus"
            spellcheck="false"
            @keydown="handleKeyDown"
            @scroll="calcScrollDistance"
            :value="modelValue == undefined ? content : modelValue"
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
import {configManager} from "../../js/utools/config";
import {INVERSE_MATCHED_WORDS, isMatchedWord, MATCHED_WORDS} from "../../js/utils/language";

export default {
  name: "CodeEditor",
  props: {
    lineNums: {
      type: Boolean,
      default: false,
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
    autofocus: {
      type: Boolean,
      default: false,
    },
    header: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: "540px",
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
    languages: {
      type: Array,
      default: function () {
        return [["javascript", "JS"]];
      },
    },
    langListWidth: {
      type: String,
      default: "110px",
    },
    langListHeight: {
      type: String,
      default: "auto",
    },
    langListDisplay: {
      type: Boolean,
      default: false,
    },
    displayLanguage: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: String,
      default: "0",
    },
    fontSize: {
      type: String,
      default: "17px",
    },
    padding: {
      type: String,
      default: "20px",
    },
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
    return {
      scrollBarWidth: 0,
      scrollBarHeight: 0,
      top: 0,
      left: 0,
      languageClass: "hljs language-" + this.languages[0][0],
      languageTitle: this.languages[0][1] ? this.languages[0][1] : this.languages[0][0],
      content: this.value,
      cursorPosition: 0,
      insertTab: false,
      lineNum: 0,
      lineNumsWidth: 0,
      scrolling: false,
      textareaHeight: 0,
      showLineNums: this.wrap ? false : this.lineNums,
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
    tabWidth() {
        switch (configManager.get('default_tab')){
          case 2:
            return '  ';
          case 4:
            return '    ';
          default:
            return '\t';
        }
      },
    updateValue(e) {
      if (this.modelValue == undefined) {
        this.content = e.target.value;
      } else {
        this.$emit("update:modelValue", e.target.value);
      }
    },
    changeLang(lang) {
      this.languageTitle = lang[1] ? lang[1] : lang[0];
      this.languageClass = "language-" + lang[0];
      this.$emit("lang", lang[0]);
    },
    tab() {
      // TODO: shift+tab 减去缩进
      document.execCommand("insertText", false, this.tabWidth());
    },
    enter(shift){
      const cursorPosition = this.$refs.textarea.selectionStart;
      let lineChar = '\n';
      const currentLineStart = this.modelValue.lastIndexOf('\n',cursorPosition-1) + 1;
      let end = currentLineStart;
      while (end < cursorPosition){
        const char = this.modelValue.charAt(end);
        if(char === '\r' || char=== '\t' || char === ' '){
          end++
        }else{
          break;
        }
      }
      if(end > currentLineStart){
        lineChar += this.modelValue.slice(currentLineStart,end);
      }
      if(shift){
        // 向后寻找下一个\n
        const currentLineEnd =  this.modelValue.indexOf('\n',cursorPosition + 1)
        if(currentLineEnd === -1){
          const temp = this.modelValue+lineChar;
          this.cursorPosition = temp.length;
          this.insertTab = true;
          this.$emit("update:modelValue",temp)
        }else{
          const temp = this.modelValue.slice(0,currentLineEnd) + lineChar + this.modelValue.slice(currentLineEnd);
          this.cursorPosition = currentLineEnd + lineChar.length;
          this.insertTab = true;
          this.$emit("update:modelValue",temp)
        }
      }else {
        document.execCommand("insertText", false, lineChar);
      }
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
    copy() {
      if (document.execCommand("copy")) {
        this.$refs.textarea.select();
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
      } else {
        navigator.clipboard.writeText(this.$refs.textarea.value);
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
    handleKeyDown(e){
      if(e.key === 'Tab'){
        e.preventDefault();
        this.tab();
      }else if(e.key === 'Enter') {
        e.preventDefault();
        this.enter(e.shiftKey);
      }else if(e.key === 'Backspace'){
        let start = this.$refs.textarea.selectionStart;
        if(start === this.$refs.textarea.selectionEnd && start < this.modelValue.length){
          if(isMatchedWord(this.modelValue[start-1],this.modelValue[start])){
            e.preventDefault()
            this.cursorPosition = start -1;
            this.insertTab = true;
            this.$emit("update:modelValue",this.modelValue.slice(0,start-1)+this.modelValue.slice(start+1))
          }else if(this.modelValue[start] === '\n' && this.modelValue[start-1] === '\n'){
            if(isMatchedWord(this.modelValue[start-2],this.modelValue[start+1])){
              e.preventDefault()
              this.cursorPosition = start -1;
              this.insertTab = true;
              this.$emit("update:modelValue",this.modelValue.slice(0,start-1)+this.modelValue.slice(start+1))
            }
          }
        }
      }else if(e.key in MATCHED_WORDS){
        e.preventDefault()
        let start = this.$refs.textarea.selectionStart;
        this.cursorPosition = start+1;
        this.insertTab = true;
        this.$emit("update:modelValue", this.modelValue.slice(0,start)
            +e.key+ MATCHED_WORDS[e.key]
            +this.modelValue.slice(start));
      }else if(e.key in INVERSE_MATCHED_WORDS){
        let start = this.$refs.textarea.selectionStart;
        if(e.key === this.modelValue[start] && INVERSE_MATCHED_WORDS[e.key] === this.modelValue[start-1]){
          this.cursorPosition = start+1;
          this.$refs.textarea.setSelectionRange(this.cursorPosition, this.cursorPosition);
          e.preventDefault()
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
    if (this.insertTab) {
      this.$refs.textarea.setSelectionRange(this.cursorPosition, this.cursorPosition);
      this.insertTab = false;
    }
    if (this.lineNums) {
      if (this.scrolling) {
        this.scrolling = false;
      } else {
        this.getLineNum();
      }
    }
  },
};
</script>

<style>
.code-editor {
  position: relative;
  background: white;
}
#dark-app #form-view .code-editor{
  background: #303133;
}
#dark-app .code-editor{
  background: #454647;
}
#dark-app .func-edit-tab .code-editor{
  background: #2c2c32;
}

.code-editor > div {
  width: 100%;
  height: 100%;
}
/* header */
.code-editor .header {
  box-sizing: border-box;
  position:fixed;
  right: 10px;
  z-index: 1;
  height: 34px;

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
.code-editor .list > .lang-list {
  border-radius: 5px;
  box-sizing: border-box;
  overflow: auto;
  font-size: 13px;
  padding: 0;
  margin: 0;
  list-style: none;
  text-align: left;
}
.code-editor .list > .lang-list > li {
  font-size: 13px;
  transition: background 0.16s ease, color 0.16s ease;
  box-sizing: border-box;
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}
.code-editor .list > .lang-list > li:first-child {
  padding-top: 5px;
}
.code-editor .list > .lang-list > li:last-child {
  padding-bottom: 5px;
}
.code-editor .list > .lang-list > li:hover {
  background: rgba(160, 160, 160, 0.4);
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
