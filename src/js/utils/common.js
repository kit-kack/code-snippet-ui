import {nextTick} from "vue";

export function debounce(fn, wait=150){
    let timer = null;
    return function(){
        if(!timer){
            timer = setTimeout(function(){
                fn()
                timer = null
            },wait)
        }
    }
}

/**
 * 刷新操作
 * @param {Ref<UnwrapRef<boolean>>} ref_flag
 * @param {Function | undefined} fn
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
