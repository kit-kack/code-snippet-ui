const decodeBase64 = (str) => Buffer.from(str, 'base64').toString();
const getFileType = (name) => {
    const index = name.lastIndexOf('.');
    if(index > 0){
        return name.slice(index+1)
    }
    return name
}
const getRequestInfo = (conf) =>{
    switch(conf.type){
        case "Gitee":
            return {
                baseURL: `https://gitee.com/api/v5/repos/${conf.repo}`,
                options:{
                    headers:{
                        'Authorization': `Bearer ${conf.token}`
                    }
                },
                subModuleUrl: `https://gitee.com/api/v5/repos/${conf.repo}/contents/.gitmodules?ref=${conf.branch ?? 'master'}`
            }
        default:
            return {
                baseURL: `https://api.github.com/repos/${conf.repo}`,
                options: {
                    headers:{
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `Bearer ${conf.token}`,
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                },
                subModuleUrl: `https://api.github.com/repos/${conf.repo}/contents/.gitmodules?ref=${conf.branch ?? 'master'}`
            }
    }
}


/**
 *
 * @param {string} content
 * @return {{}}
 */
const handleSubModuleFile = (content) => {
    const obj = {};
    const lines = content.split('\n');
    let index = 0;
    while (index < lines.length){
        let line = lines[index];
        if(line.startsWith('[submodule "') && line.endsWith('"]')){
            // submodule
            const moduleName = line.slice(12,-2);
            index++;
            while (index < lines.length){
                line = lines[index];
                let i = line.indexOf('=');
                if(i !== -1) {
                    if(line.slice(0,i).trim() === 'url'){
                        obj[moduleName] = line.slice(i + 1).trim()
                        break
                    }
                }else{
                    break;
                }
                index++;
            }
        }
        index++;

    }
    return obj;
}
/**
 * @type Hierarchy
 */
module.exports = {
    conf:{
        type:{
            name: 'Git服务器(默认Github)',
            value: ['Github', 'Gitee']
        },
        repo: {
            name: '仓库地址：{owner}/{repo}',
        },
        branch:{
            name: '仓库分支（默认master）',
            value: 'master'
        },
        token:{
            name: '私人令牌Token',
        },
        hideDotFile:{
            name: '隐藏显示.开头的文件',
            value: ['是','否']
        }
    },
    init(conf){
        this._conf = conf;
        this.requestInfo = getRequestInfo(conf);
    },
    /**
     *
     * @return HierarchyConfig
     */
    getConfig(){
        return {
            edit: true,
            form: {
                allowUpdatedProperties:{
                    tags: true,
                    desc: true,
                    type: true,
                },
            }
        }
    },
    async search(prefix, search) {
        if(!this.subModuleLoaded){
            let res = await fetch(this.requestInfo.subModuleUrl,this.requestInfo.options);
            if(res.status === 200){
                this.subModuleObj = handleSubModuleFile(decodeBase64((await res.json()).content))
            }
            this.subModuleLoaded = true;
        }
        // root
        const url = prefix.length === 1 ?`${this.requestInfo.baseURL}/git/trees/${this._conf.branch?? 'master'}` : prefix.at(-1).path
        let res = await fetch(url,this.requestInfo.options);
        if(res.status === 401){
            throw "请配置有效的个人访问令牌token";
        }
        res = await res.json();
        let path = '';
        for (let i = 1; i < prefix.length; i++) {
            path += '/' + prefix[i].name ;
        }
        const hideDotFile = this._conf.hideDotFile === '是';
        const results = [];
        for (const result of res.tree) {
            if(hideDotFile && result.path.startsWith('.')){
                continue;
            }
            const snippet = {
                name: result.path,
                id: result.sha,
                path: result.url
            }
            if(result.type === "tree"){
                snippet.dir = true;
            }else if(result.type === "blob"){
                snippet.type = getFileType(result.path)
            }else{
                snippet.path = this.subModuleObj[(path+'/'+result.path).slice(1)]
                snippet.link = true;
            }
            results.push(snippet)
        }

        return {
            unfiltered: true,
            snippets: results
        }
    },
    async resolveUrl(url,type){
        const res = await (await fetch(url,this.requestInfo.options)).json();
        return decodeBase64(res.content)
    },
    createOrEdit(prefix, snippet, oldName,ext) {
        ext.store(snippet.id,snippet)
    }
}
