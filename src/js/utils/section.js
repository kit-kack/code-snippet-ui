/**
 *
 * @param {[number,number][]} section_list 区间列表
 * @param {number} value 待删除的值
 * @param {boolean | undefined } full - 如果为true则为删除到起始部分的区间，否则只是删除当前元素
 */
function section_del(section_list,value,full){
    if(section_list.length === 0){
        return;
    }
    // 查找
    for (let i = 0; i < section_list.length; i++) {
        let section = section_list[i]
        // 找到对应区间
        if(section[0] <= value && value <= section[1]){ // [0,0] [0,10]
            if(full){
                // 删除 [start,value]的部分，而且需要保证[value+1,end]的存在
                // 删除当前元素，即为拆分
                if(section[0] === value){ // 开始
                    let new_start = section[0]+1;
                    if(new_start > section[1]){ // 移除原单值区间
                        section_list.splice(i,1)
                    }else{
                        section_list.splice(i,1,[new_start,section[1]])
                    }
                }else if(section[1] === value){ // 结尾
                    // 这里不可能存在 原单值区间
                    section_list.splice(i,1)
                }else{  // 在中间
                    section_list.splice(i,1,[value +1,section[1]])
                }

            }else{
                // 删除当前元素，即为拆分
                if(section[0] === value){ // 开始
                    let new_start = section[0]+1;
                    if(new_start > section[1]){ // 移除原单值区间
                        section_list.splice(i,1)
                    }else{
                        section_list.splice(i,1,[new_start,section[1]])
                    }
                }else if(section[1] === value){ // 结尾
                    // 这里不可能存在 原单值区间
                    section_list.splice(i,1,[section[0],section[1]-1])
                }else{  // 在中间
                    // 拆分元素
                    let one = [section[0],value -1]
                    let two = [value +1,section[1]]
                    section_list.splice(i,1,one,two)
                }
            }
            return;
        }
    }
}
/**
 * [1,3] [5,6]  --> [3, 4]
 * @param {[number,number][]} section_list
 * @param {number} value
 * @param {boolean | undefined } full
 */
function section_add(section_list,value,full){
    if(section_list.length === 0){
        section_list.push([ full ? 1 : value ,value])
    }else{
        let left_bound = value -1;
        let right_bound = value +1;
        // 全局最小区间
        if(right_bound < section_list[0][0]){
            section_list.unshift([ full ? 1 : value ,value])
            return;
        }

        /** [1,2]  [3]    [5,6]
         * 寻找 重叠区间
         * @type [number,number]
         */
        let possible_section = [-1,-1];
        let possbile_start_index = -1;
        let possbile_section_count = 0;
        let already_loop  = false;
        for (let i = 0; i < section_list.length; i++) {
            let section = section_list[i]
            // 新区间 完全 在 当前区间的 左边，后续区间不需要再遍历
            if(right_bound < section[0]){
                if(already_loop && possbile_section_count ===0){
                    // 在其内部，且没有重叠区间
                    if(full){
                        section_list.splice(i-1,1,[section_list[i-1][0],value])
                    }else{
                        section_list.splice(i,0,[value,value])
                    }
                    return;
                }
                break;
            }
            // 新区间 完全 在 当前区间的 右边，跳过当前区间
            if(section[1] < left_bound){
                already_loop = true;
                continue;
            }
            // 新区间已在 当前区间内，直接结束，无须添加
            if(section[0] <= value && value <= section[1]){
                return;
            }
            if(possbile_start_index === -1){
                possbile_start_index = i;
                possible_section[0] = section[0]
            }
            possbile_section_count++;
            possible_section[1] = section[1]
        }
        // 未找到重叠区间，即为全局最大区间
        if(possbile_start_index === -1){
            if(full){
                let last = section_list.length -1;
                section_list.splice(last,1,[section_list[last][0],value])
            }else{
                section_list.push([value,value])
            }
            return;
        }
        // 取重叠区间 最小值 和 最大值
        if(possible_section[0] === right_bound){
            if(full){
                if(possbile_start_index === 0){
                    possible_section[0] = 1;
                }else{
                    possbile_start_index --;
                    possbile_section_count++;
                    possible_section[0] = section_list[possbile_start_index][0]
                }
            }else{
                possible_section[0] = value;
            }
        }else if(possible_section[1] === left_bound){
            possible_section[1] = value;
        }
        section_list.splice(possbile_start_index,possbile_section_count,possible_section)
    }
}

function section_contain(section_list,value){
    for (const section of section_list) {
        if(section[0]<= value && value <=section[1]){
            return true;
        }
    }
    return false;
}

/**
 *
 * @param {[number,number]} section
 */
function section_generate(section){
    let array = [];
    for (let i = section[0]; i <= section[1]; i++) {
        array.push(i)
    }
    return array;
}

/**
 *
 * @param {[number,number][]} section1
 * @param {[number,number][]} section2
 */
function section_compare(section1,section2){
    if(section1){
        if(section2 && section1.length === section2.length){
            for (let i = 0; i < section1.length; i++) {
                if(section1[i][0] !== section2[i][0] || section1[i][1] !== section2[i][1]){
                    return false
                }
            }
            return true;
        }
        return false;
    }else{
        return !section2 || section2.length === 0
    }
}

/**
 * @param {[number,number][]} section
 */
function section_clone(section){
    let array = [];
    if(section && section.length > 0){
        for (let i = 0; i < section.length; i++) {
            array.push([section[i][0],section[i][1]])
        }
    }
    return array
}

export {
    section_add,section_del,section_contain,section_generate,section_compare,section_clone
}