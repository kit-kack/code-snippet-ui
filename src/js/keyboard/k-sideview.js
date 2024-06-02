import {Direction, doScrollForHelpView, doScrollForSideView} from "../utils/scroller";
import {$reactive} from "../store";

/**
 * @type {KeyDownHandler}
 */
export const K_SETTING_DOWN = ({code,shift,double})=>{
    if($reactive.setting.funcEditActive || $reactive.setting.specialTagConfigActive){
        return false;
    }
    switch (code){
        case 'KeyJ':
        case 'ArrowDown':
            doScrollForSideView(Direction.DOWN,shift)
            break;
        case 'KeyK':
        case 'ArrowUp':
            doScrollForSideView(Direction.UP,shift);
            break;
        case 'KeyG':
            if(double){
                doScrollForSideView(Direction.RESET,false);
            }else if(shift){
                doScrollForHelpView(Direction.END,false);
            }
            break;
        case 'Slash':
        case 'KeyQ':
        case 'Space':
            $reactive.main.settingActive = false;
            break
    }
    return true
}