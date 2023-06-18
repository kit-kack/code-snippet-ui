<template>
  <div id="root">
    <n-form
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        style="margin-top:10px;max-width: 750px; width: 100%;position: fixed;left: 50%; top:50%;transform: translate(-50%, -50%);height: 100%;"
        :rules="rules"
        :model="codeTemplate"
        ref="form"
    >
      <n-form-item label="代码片段名" path="name">
        <n-input v-model:value="codeTemplate.name" clearable autofocus/>
      </n-form-item>
      <n-form-item label="代码描述" path="desc">
        <n-input v-model:value="codeTemplate.desc" clearable/>
      </n-form-item>
      <n-form-item label="标签" path="tags">
        <n-dynamic-tags v-model:value="codeTemplate.tags">
          <template #input="{ submit, deactivate }">
            <n-select
                v-model:value="tempTag"
                filterable tag
                @blur="submit(tempTag);tempTag=null"
                :options="tags"
                placeholder="请选择或输入标签"
            />
          </template>
        </n-dynamic-tags>
      </n-form-item>
      <n-form-item label="代码" path="code">
        <template #default>
          <div id="main">
            <n-input
                v-model:value="codeTemplate.code"
                placeholder="请输入代码片段"
                type="textarea"
                size="small"
                style="padding-top: 40px;padding-bottom: 5px"
                show-count
                @keydown="handleKeyDown"
                ref="codeTextArea"
                :autosize="{minRows: 10,maxRows: 10}"/>
            <div id="sub">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-radio-group id="tab" size="small" v-model:value="tabValue" :default-value="configManager.get('whatTabDo')??0" @update:value="v=> configManager.set('whatTabDo',v)" name="radiogroup">
                    <n-space :size="1">
                      <n-radio v-for="op in tabOptions" :key="op.value" :value="op.value" name="radiogroup">
                        {{ op.label }}
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </template>
                Tab键的原生行为默认是切换焦点，这里可以定制行为
              </n-tooltip>

              <n-select
                  v-model:value="codeTemplate.type"
                  filterable
                  placeholder="选择代码类型"
                  :options="languages"
                  id="select"
                  :default-value="codeSnippet.type??'plaintext'"
                  tag
              />
            </div>
          </div>
        </template>
      </n-form-item>


      <div id="btn">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button id="cancel" strong secondary type="warning"  class="btn" @click="handleCancel">
              取消
            </n-button>
          </template>
          {{CtrlStr+'+Q'}}
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button strong secondary type="success"  class="btn" @click="handleUpdate">
              保存
            </n-button>
          </template>
          {{CtrlStr+'+S'}}
        </n-tooltip>
      </div>
    </n-form>
  </div>

</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {codeSnippetManager, configManager, tagColorManager} from "../js/core.js";
import {handleRecoverLiteShow, languages} from "../js/some.js";
import {$var, LIST_VIEW, UPDATE_VIEW} from "../js/store";
const CtrlStr = utools.isMacOS()? 'Command':'Ctrl';
const form = ref()
const codeSnippet = ($var.currentMode === UPDATE_VIEW)? codeSnippetManager.get($var.currentName) :{
  code: $var.others.code
}
const codeTemplate = reactive({
  ...codeSnippet
})
let tempTag = ref()
const tags = computed(()=>{
  return tagColorManager.all().map(v=>{
    return {
      label:v,
      value:v
    }
  })
})
const tabValue = ref()
const codeTextArea = ref()
const tabOptions = [
  {label: '原生行为',value: 0},
  {label: '\\t制表符',value: 1},
  {label: '2个空格',value: 2},
  {label: '4个空格',value: 4}
]

const rules = {
  "name":[
    {
      required: true,
      message: '代码片段名必须为非空字符串',
      validator(rule,value){
        return value!=null && value.trim() !== '';
      },
      trigger: ["input","blur"]
    },
    {
      message: "代码片段名已重复",
      validator(rule, value) {
        if($var.currentMode === UPDATE_VIEW && codeSnippet.name === value){
          return true;
        }
        return !codeSnippetManager.contain(value)
      },
      trigger: ["input","blur"]
    }

  ],
  "code":{
    required:true,
    message:"请放置代码片段"
  }
}

const handleCancel = ()=>{
  $var.utools.keepSelectedStatus = true;
  handleRecoverLiteShow()
  $var.currentMode = LIST_VIEW;
}
const handleUpdate = ()=>{
  form.value.validate().then(error=>{
      if(error!=null && error.length >= 0){
        window.$message.warning("请按要求填写")
      }else{
        codeSnippet.code = codeTemplate.code;
        codeSnippet.desc = codeTemplate.desc;
        codeSnippet.tags = [...new Set(codeTemplate.tags)];
        codeSnippet.type = codeTemplate.type?? "plaintext";

        if($var.currentMode === UPDATE_VIEW){
          if(codeSnippet.name === codeTemplate.name){
            $var.utools.keepSelectedStatus = true;
            codeSnippetManager.update(codeSnippet)
          }else{
            $var.utools.keepSelectedStatus = null;
            // 这里清理查询缓存
            delete codeSnippet.query;
            codeSnippetManager.replace(codeTemplate.name,codeSnippet)
          }
        }else{
          codeSnippet.name = codeTemplate.name;
          $var.utools.keepSelectedStatus = null;
          codeSnippetManager.add(codeSnippet)
        }
        window.$message.success("操作成功")
        handleRecoverLiteShow()
        $var.currentMode = LIST_VIEW;
        $var.others.code = null;
      }
  },()=>{
    window.$message.warning("请按要求填写")
  })
}

onMounted(()=>{
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey){
      if(e.code === 'KeyQ'){
        handleCancel();
      }else if(e.code === 'KeyS'){
        handleUpdate();
        e.preventDefault();
      }
    }
  })
})

const handleKeyDown = (e)=>{
  if(e.code === 'Tab'){
    let char;
    switch (configManager.get('whatTabDo')){
      case 1:
        char = '\t';
        break;
      case 2:
        char = '  ';
        break;
      case 4:
        char = '    ';
        break;
      default:
        return;
    }
    e.preventDefault();
    codeTemplate.code =
        codeTemplate.code.slice(0,codeTextArea.value.textareaElRef.selectionStart)
        +char
        +codeTemplate.code.slice(codeTextArea.value.textareaElRef.selectionStart)
  }
}

</script>

<style scoped>
#root{
  padding: 20px;
}
#main{
  position: relative;
  width: 100%;
  height: 270px;
}
#sub{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  border-bottom: 1px dashed #36ad6a;
  padding: 2px;
}
#select{
  border: none;
  width:250px;
  float: right;
}
#tab{
  float: left;
  margin-top: 6px;
  margin-left: 6px;
}
#btn{
  width: 100%;
  display: flex;
  justify-content: center;
}
#cancel{
  margin-right: 20px;
}
.btn{
  width: 100px;
}

</style>