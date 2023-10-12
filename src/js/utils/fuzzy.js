// 计算最长公共子序列
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
    console.log(dp[m][n])
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

