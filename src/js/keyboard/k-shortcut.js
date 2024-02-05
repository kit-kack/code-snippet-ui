import {Direction, doScrollForHelpView} from "../utils/scroller";
import {$reactive} from "../store";

/**
 * @type {KeyHandler}
 */
export const K_SHORTCUT = ({code,shift,double})=>{
    switch (code){
        case 'KeyJ':
            doScrollForHelpView(Direction.DOWN,shift)
            break;
        case 'KeyK':
            doScrollForHelpView(Direction.UP,shift);
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
            break;
        default:
            return false;
    }
    return true
}