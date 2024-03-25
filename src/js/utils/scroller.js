import {$index, $normal} from "../store";
import {configManager} from "../utools/config";


export const Direction = {
    RESET:-1,
    END: -2,
    DOWN:1,
    UP:2,
    // ---------
    LEFT:3,
    RIGHT:4
}

/**
 * 控制滚动条滚动
 * @param scrollBar
 * @param {number} direction
 * @param {boolean} fast
 * @private
 */
function _controlScrollBar(scrollBar,direction,fast){
    const distance = fast? 50: 10;
    switch (direction){
        case Direction.LEFT:
            scrollBar?.scrollBy?.({left: -distance})
            break;
        case Direction.DOWN:
            scrollBar?.scrollBy?.({top: distance})
            break;
        case Direction.UP:
            scrollBar?.scrollBy?.({top: -distance})
            break;
        case Direction.RIGHT:
            scrollBar?.scrollBy?.({left: distance})
            break;
        case Direction.END:
            scrollBar?.scrollTo?.({top: 1e6,behavior:'smooth'})
            break
        case Direction.RESET:
            scrollBar?.scrollTo?.({left:0,top:0,behavior:'smooth'})
            break;
    }
}
// /**
//  * 控制原生元素滚动条滚动
//  * @param scrollBar
//  * @param {number} direction
//  * @param {boolean} fast
//  * @private
//  */
// function _rawControlScrollBar(scrollBar,direction,fast){
//     const distance = fast? 50: 10;
//     switch (direction){
//         case Direction.LEFT:
//             scrollBar.scrollLeft -= distance;
//             break;
//         case Direction.DOWN:
//             scrollBar.scrollTop += distance;
//             break;
//         case Direction.UP:
//             scrollBar.scrollTop -= distance;
//             break;
//         case Direction.RIGHT:
//             scrollBar.scrollLeft += distance;
//             break;
//         case Direction.RESET:
//             scrollBar.scrollTop = 0;
//             scrollBar.scrollLeft = 0;
//             break;
//     }
// }

/**
 * 控制多行代码块滚动
 * @param {number} direction
 */
export function doScrollForMultiLineCode(direction){
    _controlScrollBar($normal.scroll.itemCodeInvoker,direction,false)
}

/**
 * 控制侧边代码预览界面滚动
 * @param {number} direction
 */
export function doScrollForSideCodeView(direction){
    switch (direction){
        case Direction.LEFT:
        case Direction.RIGHT:
            _controlScrollBar($normal.scroll.sideCodeHorizontalInvoker,direction,false)
            break
        case Direction.UP:
        case Direction.DOWN:
            _controlScrollBar($normal.scroll.sideCodeVerticalInvoker,direction,false)
            break
        case Direction.END:
            _controlScrollBar($normal.scroll.sideCodeVerticalInvoker,direction,false)
            break
        default:
            _controlScrollBar($normal.scroll.sideCodeHorizontalInvoker,direction,false)
            _controlScrollBar($normal.scroll.sideCodeVerticalInvoker,direction,false)
            break
    }
}

/**
 * 控制代码预览界面滚动
 * @param {number} direction
 * @param {boolean} fast
 */
export function doScrollForCodeView(direction,fast){
    switch (direction){
        case Direction.LEFT:
        case Direction.RIGHT:
            _controlScrollBar($normal.scroll.codeHorizontalInvoker,direction,fast)
            break
        case Direction.UP:
        case Direction.DOWN:
            _controlScrollBar($normal.scroll.codeVerticalInvoker,direction,fast)
            break
        case Direction.END:
            _controlScrollBar($normal.scroll.codeVerticalInvoker,direction,fast)
            break
        default:
            _controlScrollBar($normal.scroll.codeHorizontalInvoker,direction,fast)
            _controlScrollBar($normal.scroll.codeVerticalInvoker,direction,fast)
            break
    }
}

/**
 * 控制【快捷方式】界面滚动
 * @param {number} direction
 * @param fast
 */
export function doScrollForHelpView(direction,fast){
    _controlScrollBar($normal.scroll.helpInvoker,direction,fast);
}

/**
 * 控制【TopNav】界面滚动
 */
export function doScrollForTopNav(){
    $normal.scroll.hierarchyInvoker?.scrollBy?.({left: 100})
}

export function doScrollForListView(){
    try{
        $normal.scroll.virtualInvoker?.scrollToItem(
            $index.value - ((configManager.get('strategy_item_code_show') === 2)?1: 3)
        )
    }catch (e) {
        console.error(e)
    }
}