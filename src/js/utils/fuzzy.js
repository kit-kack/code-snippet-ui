// 计算最长公共子序列
function _longestCommonSubsequence(str1, str2) {
    let m = str1.length, n = str2.length;
    let cache = new Array(m + 1).fill().map(() => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (str1.charAt(i) == str2.charAt(j)){
                
            cache[i][j] = cache[i + 1][j + 1] + 1;
            }else {
                cache[i][j] = Math.max(cache[i][j + 1], cache[i + 1][j])
            }
        }
    }
    return cache[0][0];
}
export function fuzzyCompare(query,target){
    return _longestCommonSubsequence(query,target) === query.length
}