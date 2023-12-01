import _ from "lodash";

/**
 * 操作使其同utools.dbStorage.setItem操作
 * @param key
 * @param value
 */
export function utools_db_store(key, value){
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

/**
 * 使用uTools内置浏览器打开
 * @param {string} href
 */
export function utools_browser_open(href){
    const idleBrowsers = utools.getIdleUBrowsers();
    const browser = utools.ubrowser.goto(href).show()
    if(_.isEmpty(idleBrowsers)){
        browser.run({
            center: true
        })
    }else{
        browser.run(idleBrowsers[0].id)
    }
}