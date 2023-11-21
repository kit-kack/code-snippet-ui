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