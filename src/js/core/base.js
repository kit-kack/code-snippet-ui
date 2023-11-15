/**
 * 操作使其同utools.dbStorage.setItem操作
 * @param key
 * @param value
 */
export function createOrUpdate(key,value){
    const result = utools.db.get(key)
    if(result == null){
        utools.db.put({
            _id: key,
            data: value
        })
    }else{
        utools.db.put({
            _id: key,
            data: value,
            _rev: result._rev
        })
    }
}

const FEATURE_CODE = 'code-snippet-keyword';

export function add_utools_feature(cmd){
    const features = utools.getFeatures([FEATURE_CODE]);
    if (features && features.length > 0) {
        /**
         *
         * @type {string[]}
         */
        const cmds = features[0].cmds??[];
        const index = cmds.indexOf(cmd);
        if(index === -1){
            cmds.push(cmd)
            utools.setFeature({
                code: FEATURE_CODE,
                explain: '粘贴代码片段',
                cmds: cmds
            })
            $message.success("新增uTools关键字："+cmd)
        }
    } else {
        utools.setFeature({
            code: 'code-snippet-keyword',
            explain: '粘贴代码片段',
            cmds: [cmd]
        })
        $message.success("新增uTools关键字："+cmd)
    }
}

export function remove_utools_feature(cmd){
    const features = utools.getFeatures([FEATURE_CODE]);
    if(features && features.length > 0){
        /**
         *
         * @type {string[]}
         */
        const cmds = features[0].cmds??[];
        const index = cmds.indexOf(cmd);
        if(index !== -1){
            cmds.splice(index,1)
            if(cmds.length === 0){
                utools.removeFeature(FEATURE_CODE)
            }else{
                utools.setFeature({
                    code: FEATURE_CODE,
                    explain: '粘贴代码片段',
                    cmds: cmds
                })
            }
            $message.info("移除uTools关键字："+cmd)
        }
    }
}
