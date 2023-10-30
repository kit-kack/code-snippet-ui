// 计算最长公共子序列
import {configManager} from "../core/config";

export function fuzzyCompare(query, target) {
    let m = query.length, n = target.length;
    const dp = Array.from(Array(m+1),()=> Array(n+1).fill(0));
    /*    j  target
       i  0   1
   query  2   X

     */
    const path = Array.from(Array(m+1),()=> Array(n+1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (query[i - 1] === target[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                path[i][j] = 0;
            } else {
                if(dp[i -1][j] > dp[i][j-1]){
                    dp[i][j] = dp[i -1][j]
                    path[i][j] = 1
                }else{
                    dp[i][j] = dp[i][j -1]
                    path[i][j] = 2
                }
            }
        }
    }
    // 先比较是否匹配
    if(dp[m][n] === query.length){
        const offsets = [];
        // 进行回溯
        let i = m;
        let j = n;
        while (i>0 && j>0){
            switch (path[i][j]){
                case 0:
                    offsets.unshift(j-1)
                    i--;
                    j--;
                    break
                case 1:
                    i--;
                    break
                case 2:
                    j--;
                    break
            }
        }

        // 开始字符串拼凑
        return offsets
    }
    // 没有全匹配
    return null
}

/**
 *
 * @param {string} query 需要提前转小写
 * @param {string} target 原本文字
 */
export function match(query,target){
    const temp = target.toLowerCase();
    const prefix = `<span style="color: ${configManager.getGlobalColor()}">`
    const suffix = "</span>"
    // 1. 普通比较
    if(temp.includes(query)){
        return target.replace(new RegExp(query,"i"),`${prefix}$&</span>`);
    }else{
        const offsets = fuzzyCompare(query,temp);
        if(offsets){
            // 拆分替换
            const charArray = target.split('')
            for (let offset of offsets) {
                charArray[offset] = prefix+charArray[offset]+suffix;
            }
            return charArray.join('');
        }
    }
    return null;
}

