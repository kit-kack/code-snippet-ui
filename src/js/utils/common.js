import {nextTick} from "vue";


/**
 * 刷新操作
 * @param {import('vue').Ref<boolean>} ref_flag
 * @param {Function} [fn]
 */
export function getRefreshFunc(ref_flag,fn){
    if(fn){
        return ()=>{
            ref_flag.value  = false;
            nextTick(()=>{
                ref_flag.value = true;
                fn();
            })
        }
    }else{
        return ()=>{
            ref_flag.value  = false;
            nextTick(()=>{
                ref_flag.value = true;
            })
        }
    }

}

/**
 * 检查是否存在字符串（忽略大小写匹配）
 * @param {string[]} array
 * @param {string} target
 */
export function lowercaseIncludes(array, target){
    for (let str of array) {
        if(target === str.toLowerCase()){
            return true;
        }
    }
    return false;
}

/**
 * 计算与当前的相差时间
 * @param {null | number} time
 * @returns {string}
 */
export function calculateTime(time){
    if(time == null){
        return '未知';
    }
    let old = new Date(time);
    let difftime = (Date.now() -old)/1000; //计算时间差,并把毫秒转换成秒
    let days = Math.trunc(difftime/86400); // 天  24*60*60*1000
    if(days > 0){
        if(days > 10){
            return old.toLocaleDateString();
        }else if(days === 1){
            return '昨天'
        }else if(days === 2){
            return '前天'
        }else{
            return days+'天前'
        }
    }
    let hours = Math.trunc(difftime/3600)-24*days;    // 小时 60*60 总小时数-过去的小时数=现在的小时数
    if(hours > 0){
        return hours+'小时前';
    }
    let minutes = Math.trunc(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    if(minutes > 0){
        return minutes+'分钟前';
    }
    let seconds = Math.trunc(difftime%60);  // 以60秒为一整份 取余 剩下秒数

    if(seconds> 0){
        return seconds+'秒前';
    }
    return '现在';
}

const networkRegex = /^\w+:\/\/.*/
/**
 * 判断URI是否为网络URI
 * @param {string} uri
 * @type {boolean}
 */
export function isNetWorkUri(uri){
    return  networkRegex.test(uri);
}

export function isSvg(content){
    const c = content.trim();
    return c.startsWith('<svg') && c.endsWith('</svg>')
}
