export function debounce(fn,wait=150){
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
