console.log('preload')

import { readFileSync, appendFileSync} from 'fs'
utools.setExpendHeight(0)
utools.onPluginEnter(()=>{
    utools.setExpendHeight(0)
})
export const readConfig = (path) => readFileSync(path).toString();
export const writeConfig = (path,str)=> appendFileSync(path,str);