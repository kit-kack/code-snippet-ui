import {utools_db_store} from "./base";
import {$index, $reactive, CREATE_VIEW, EDIT_VIEW} from "../store";
import { clone as _clone } from "lodash-es"
import {CODE_PREFIX, codeSnippetManager} from "./snippet";
import {GLOBAL_HIERARCHY} from "../hierarchy/core";
import {configManager} from "./config";
/**
 *
 * Snippet Hierarchy Hub 职责
 * - 处理 Top
 * - 处理 Count&Time
 * - 处理 Sections
 * - 处理 Delete -- Recycle bin
 * - 处理 ...
 */
const HIERARCHY_PREFIX = "hub/";
const ROOT_HIERARCHY_PREFIX = "hub";

// 3天时间戳
const THREE_DAYS = 10 * 1000 // 3 * 24 * 60 * 60 * 1000



function _getHierarchyHub(key){
    return (utools.db.get(key)?.data) ?? {}
}

export const hierachyHubManager = {
    /**
     * @type {HierarchyHub}
     */
    currentHub: _getHierarchyHub(ROOT_HIERARCHY_PREFIX),
    currentPrefix: null,
    currentClonedTopList: [],
    isInited: false,

    init(){
        if(this.isInited){
            return;
        }
        this.changeHub(null)
        this.isInited = true
    },
    _syncTopList(){
      this.currentClonedTopList = _clone(this.currentHub.topList)??[]
    },

    changeHub(prefix){
        if(prefix){
            this.currentHub = _getHierarchyHub(HIERARCHY_PREFIX+prefix)
        }else{
            // root
            this.currentHub = _getHierarchyHub(ROOT_HIERARCHY_PREFIX)
        }
        this.currentPrefix = prefix;
        this._syncTopList();
    },
    store(){
      if(this.currentPrefix){
          utools_db_store(HIERARCHY_PREFIX+this.currentPrefix,this.currentHub)
      }else{
          utools_db_store(ROOT_HIERARCHY_PREFIX,this.currentHub)
      }
    },
    /**
     * @return {string[]}
     */
    getTopList(){
      return this.currentClonedTopList;
    },

    /**
     * 处理置顶相关
     * @param {string} eleName
     * @param {"auto" | "set" | "cancel" } mode
     */
    handleTop(eleName,mode){
        const topList = this.currentHub.topList ?? [];
        const index = topList.indexOf(eleName);
        if(index === -1){
            if(mode !== "cancel"){
                // 添加进去
                topList.push(eleName)
                // 更新index
                // isReadmeShow
                const isReadmeShow = !configManager.get('readme_close') || $reactive.utools.search;
                $index.value = topList.length - (isReadmeShow? 0 : 1);
            }
        }else{
            if(mode !== "set"){
                // 移除
                topList.splice(index,1)
            }
        }
        // 保存
        this.currentHub.topList = topList;
        this._syncTopList();
        this.store();
    },


    /**
     *
     * @param {string} name
     * @param {Array<[number,number]>} sections
     */
    handleSections(name,sections){
        if (!this.currentHub.snippets) {
            this.currentHub.snippets = {};
        }
        const snippetHub = this.currentHub.snippets;

        const temp = snippetHub[name] ?? {};
        if(sections && sections.length > 0){
            temp.sections = sections;
        }else{
            delete temp.sections
        }
        // 后置处理
        if(Object.keys(temp).length === 0){
            delete snippetHub[name]
        }else{
            // 保存数据
            snippetHub[name] = temp;
        }
        this.store();
    },
    handle_desc_tags_type(name,obj){
        if (!this.currentHub.snippets) {
            this.currentHub.snippets = {};
        }
        const snippetHub = this.currentHub.snippets;

        const temp = snippetHub[name] ?? {};
        if("desc" in obj){
            const desc = obj.desc;
            if(desc){
                temp.desc = desc;
            }else{
                delete temp.desc
            }
        }
        if("tags" in obj){
            const tags = obj.tags;
            if(tags && tags.length > 0){
                temp.tags = tags;
            }else{
                delete temp.tags
            }
        }
        if("type" in obj){
            const type = obj.type;
            if(type){
                temp.type = type;
            }else{
                delete temp.type
            }
        }
        // 后置处理
        if(Object.keys(temp).length === 0){
            delete snippetHub[name]
        }else{
            // 保存数据
            snippetHub[name] = temp;
        }
        this.store();
    },
    removeElement(name){
        // top
        const topList = this.currentHub.topList ?? [];
        const index = topList.indexOf(name);
        if(index !== -1){
            // 移除
            topList.splice(index,1)
        }
        this._syncTopList()
        // snippet data
        if(this.currentHub.snippets){
            delete this.currentHub.snippets[name]
        }
        // recycle bin
        if(this.currentHub.recycleBin){
            delete this.currentHub.recycleBin[name]
        }
        // store
        this.store()
    },
    recycleElement(id){
        const recycleBin = this.currentHub.recycleBin ?? {};
        const obj = {
            expired: Date.now() + THREE_DAYS,
        };
        if(codeSnippetManager.recycle(id,GLOBAL_HIERARCHY.currentPrefixIdStr)){
            obj.keyword = true;
        }
        recycleBin[id] = obj;
        this.currentHub.recycleBin = recycleBin;
        this.store()
    },
    resumeElement(id,continueFlag = false){
        const recycleBin = this.currentHub.recycleBin ?? {};
        const obj = recycleBin[id];
        if(obj && !continueFlag){
            if(!codeSnippetManager.resume(id,GLOBAL_HIERARCHY.currentPrefixIdStr,obj.keyword)){
                $message.warning("恢复冲突：代码片段名已重复，需重新定义!");
                // conflict 恢复冲突
                $reactive.main.isRecycleConflict = true;
                GLOBAL_HIERARCHY.changeView(CREATE_VIEW);
                return false;
            }
        }
        delete recycleBin[id];
        this.currentHub.recycleBin = recycleBin;
        this.store()
        return true;
    },
    renameElment(oldName,newName){
        // top
        const topList = this.currentHub.topList ?? [];
        const index = topList.indexOf(name);
        let flag = false;
        if(index !== -1){
            // 移除
            topList.splice(index,1,newName)
            this._syncTopList()
            flag = true;
        }
        // snippet data
        if(this.currentHub.snippets){
            if( oldName in this.currentHub.snippets){
                this.currentHub.snippets[newName] = this.currentHub.snippets[oldName]
                delete this.currentHub.snippets[oldName]
                flag = true;
            }
        }
        // store
        if(flag){
            this.store()
        }
    },
    backup(zip,dirname){
        let count = 0;
        zip.file(`${dirname}/${count++}.json`,JSON.stringify({
            data: _getHierarchyHub(ROOT_HIERARCHY_PREFIX),
            _id: ROOT_HIERARCHY_PREFIX
        },null,2))
        utools.db.allDocs(HIERARCHY_PREFIX).forEach(doc =>{
            zip.file(`${dirname}/${count++}.json`,JSON.stringify({
                data: doc.data,
                _id: doc._id
            },null,2))
        });
    },
    async load(zip,dirname) {

        try{
            const zipItems = zip.file(new RegExp('^'+dirname+'/.+\\.json$'))
            for (const item of zipItems){
                if(item.dir){
                    continue;
                }
                const obj = JSON.parse(await item.async("string"))
                if(obj._id && obj.data){
                    // only handle root : topList去除无效元素
                    const newTopList = [];
                    if(obj._id === ROOT_HIERARCHY_PREFIX){
                        const topList = obj.data.topList ?? [];
                        for (const topId of topList) {
                            if(utools.db.get(CODE_PREFIX + topId)){
                                newTopList.push(topId)
                            }
                        }
                        obj.data.topList = newTopList
                    }
                    utools_db_store(obj._id,obj.data)
                }
            }
        }catch (e){
            utools.showNotification(`解析${dirname}目录内容时发生异常，原因为${e.message}`)
        }
    }
}


export function deleteHub(prefix){
    // delete current
    const key  = HIERARCHY_PREFIX+prefix;
    console.log('delete hub ['+key + ']')
    utools.db.remove(key)
    // delete sub hub
    utools.db.allDocs(key+"/").forEach(doc =>{
        utools.db.remove(doc._id)
    })
    // delete sub snippet
    utools.db.allDocs('#code/'+prefix+"/").forEach(doc =>{
        utools.db.remove(doc._id)
    })
    utools.db.allDocs('#code/'+prefix+"#").forEach(doc =>{
        utools.db.remove(doc._id)
    })
}
