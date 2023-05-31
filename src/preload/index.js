console.log('preload')

import { readFileSync, appendFileSync} from 'fs'

export const readConfig = (path) => readFileSync(path).toString();
export const writeConfig = (path,str)=> appendFileSync(path,str);