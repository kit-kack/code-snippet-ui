import {Direction, doScrollForHelpView} from "../utils/scroller";
import {$reactive} from "../store";

/**
 * @type {KeyDownHandler}
 */
export const K_SHORTCUT_DOWN = ({code,shift,double})=>{
    switch (code){
        case 'KeyJ':
        case 'ArrowDown':
            doScrollForHelpView(Direction.DOWN,shift)
            break;
        case 'KeyK':
        case 'ArrowUp':
            doScrollForHelpView(Direction.UP,shift);
            break;
        case 'KeyH':
        case 'ArrowLeft':
            if($reactive.common.shortcutTabIndexForCodeView === 0){
                $reactive.common.shortcutTabIndexForCodeView = 2;
            }else{
                $reactive.common.shortcutTabIndexForCodeView--;
            }
            break;
        case 'KeyL':
        case 'ArrowRight':
            if($reactive.common.shortcutTabIndexForCodeView === 2){
                $reactive.common.shortcutTabIndexForCodeView = 0;
            }else{
                $reactive.common.shortcutTabIndexForCodeView++;
            }
            break;
        case 'KeyG':
            if(double){
                doScrollForHelpView(Direction.RESET,false);
            }else if(shift){
                doScrollForHelpView(Direction.END,false);
            }
            break;
        case 'KeyZ':
        case 'KeyQ':
        case 'Space':
            $reactive.common.shortcutActive = false;
            break
        default:
            return false;
    }
    return true
}