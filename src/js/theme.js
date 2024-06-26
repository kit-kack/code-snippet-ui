import {darkTheme} from "naive-ui";
import {ref} from "vue";
import {configManager} from "./utools/config";
import {$normal} from "./store";

const theme = ref(utools.isDarkColors()? darkTheme:null);

export function adjustLightDarkTheme(){
    const id = document.body.id;
    const dark = utools.isDarkColors();
    const lightId = utools.getAppVersion().startsWith('4.') ? 'light-app':'light-app-v5';
    if(id){
        const newId = dark? "dark-app":lightId;
        if(id !== newId){
            document.body.id = newId;
            theme.value = dark? darkTheme:null;
            changeSelectThemeOverrides(dark);
            adjustTheme(configManager.get('strategy_theme')??0)
            globalThemeRefresh()
        }
    }else{
        document.body.id = dark? "dark-app":lightId;
        changeSelectThemeOverrides(dark);
    }
}

const colorSchemaStyleOptions = [
    {
        globalColor: '#65b88cff',
        selectedColor: '#f9fff5ff',
        highColor: '#d1f8e3aa'
    },
    {
        globalColor: '#40a9ffff',
        selectedColor: '#e6f2ffff',
        highColor: '#bbd9f1bb'
    },{
        globalColor: '#b37febff',
        selectedColor: '#f9f0ffff',
        highColor: '#E8D9F8AA'
    },{
        globalColor: '#ff85c0ff',
        selectedColor: '#fff0f6ff',
        highColor: '#fdd8eaaa'
    }
    ,{
        globalColor: '#fdc253ff',
        selectedColor: '#fffbe6ff',
        highColor: '#f6e6c8aa'
    }
    ];
const darkColorSchemaStyleOptions = [
    {
        globalColor: '#5ccb8fff',
        selectedColor: '#343c38ff',
        highColor: '#1A49319E'
    },
    {
        globalColor: '#90caf9ff',
        selectedColor: '#2d3945ff',
        highColor: '#90caf955'
    },{
        globalColor: '#9f72d7ff',
        selectedColor: '#3e3747ff',
        highColor: '#4a386155'
    },{
        globalColor: '#d25696ff',
        selectedColor: '#4d3641ff',
        highColor: '#562940AF'
    },{
        globalColor: '#f2c55cff',
        selectedColor: '#524b3fff',
        highColor: '#EC9E0721'
    }
    ];

function adjustTheme(v){
    $normal.theme = utools.isDarkColors()? darkColorSchemaStyleOptions[v]: colorSchemaStyleOptions[v];
    modifyCSSVar()
}

function modifyCSSVar(){
    document.documentElement.style.setProperty('--global-color', $normal.theme.globalColor);
    document.documentElement.style.setProperty('--selected-color', $normal.theme.selectedColor);
    document.documentElement.style.setProperty('--high-color', $normal.theme.highColor);
}
/**
 *
 * @return { import('naive-ui').GlobalThemeOverrides }
 */
function getThemeOverrides(){
    configManager.init();
    const gc = $normal.theme.globalColor;
    const bg = $normal.theme.selectedColor;
    const borderHover = `1px solid ${utools.isDarkColors()? '#737475':'#aaa'}`
    const border = `1px solid ${gc}`
    const textOrCaretColorVar =  utools.isDarkColors()? 'white': '#4b4e51';
    const inputBorderVar =  `1px solid ${utools.isDarkColors()? '#303133': '#e0e0e6'}`;

    const lightBoxShadowFoucsAndActive = `0 2px 9px 0 rgba(100,100,111,.2)`
    const borderFoucs =  `1px solid ${utools.isDarkColors()? '#737475':'#aaa'}`

    return {
        Breadcrumb:{
            itemTextColorHover: gc,
            itemTextColorPressed: gc,
            itemColorHover: bg,
            itemColorPressed:bg,
            fontSize: '12px'
        },
        Switch:{
            railColorActive: gc,
            boxShadowFocus: 'none',
            loadingColor: gc
        },
        Tooltip:{
            color: utools.isDarkColors()? '#2a2a2c':'#fafafc',
            textColor: utools.isDarkColors()? '#fafafc':'#2a2a2c'
        },
        Tag:{
            colorChecked: gc,
            colorCheckedHover: gc,
            colorCheckedPressed:gc,
            border: utools.isDarkColors()? undefined:'none'
        },
        Input:{
            borderFocus: borderFoucs,
            boxShadowFocus: utools.isDarkColors()? 'none': lightBoxShadowFoucsAndActive,
            borderHover: borderHover,
            border: inputBorderVar,
            caretColor: textOrCaretColorVar,
        },
        Select:{
            peers:{
                InternalSelection:{
                    textColor: textOrCaretColorVar,
                    border: inputBorderVar,
                    borderHover: inputBorderVar,
                    borderFocus: inputBorderVar,
                    borderActive: borderHover,
                    boxShadowFocus: 'none',
                    boxShadowActive: 'none',
                    clearColorHover: 'none',
                    caretColor: textOrCaretColorVar,
                    colorFocus: 'white',
                    colorActive: utools.isDarkColors()? '#575859': '#fff'
                },
                Popover:{
                    boxShadow: '0 0 0 2px red',
                    color: 'red',
                    textColor: 'red'
                },
                InternalSelectMenu:{
                    optionCheckColor: gc,
                    optionTextColorActive: gc,
                    optionTextColorPressed: gc,
                    height: '200px'
                }
            }
        },
        Button:{
            borderHover: border,
            borderFocus: border,
            borderPressed: border,
            textColorPressed: utools.isDarkColors()? 'white': 'black',
            textColorHover: gc,
            textColorFocus: gc,
            textColorPreressed: gc,
            textColorGhostHover: gc,
            textColorGhostFocus: gc,
            textColorGhostPressed: gc,
            textColorTextHover: gc,
            textColorTextFocus: gc,
            rippleColor: 'transparent',
        },
        Tabs:{
            tabTextColorHoverLine: gc,
            tabTextColorActiveLine: gc,
            tabTextColorActiveBar: gc,
            tabTextColorHoverBar: gc,
            barColor: gc
        },
        Checkbox:{
            colorChecked: gc,
            borderChecked: border,
            borderFocus: border,
        }
        // DynamicTags:{
        //     peers:{
        //         Tag:{
        //             textColor: gc
        //         }
        //     }
        // },
    }
}
const themeOverrides = ref(getThemeOverrides())
const globalThemeRefresh = ()=>{
    themeOverrides.value = getThemeOverrides()
}
const selectThemeOverrides = {
    peers:{
        InternalSelection:{
            border: `1px solid transparent`,
            borderActive: `1px solid transparent`,
            borderHover: `1px solid transparent`,
            borderFocus: `1px solid transparent`,
            boxShadowHover: 'none',
            boxShadowActive: 'none',
            boxShadowFocus: 'none',
            textColor: 'black',
            borderRadius: 0,
            color:'transparent',
            colorFocus: 'white',
            colorActive: '#fff'
        }
    }
}
function changeSelectThemeOverrides(dark){
    selectThemeOverrides.peers.InternalSelection.textColor = dark ? 'white' : 'black'
    selectThemeOverrides.peers.InternalSelection.colorActive =  dark? '#575859' : '#fff'
}

export {
    theme,
    themeOverrides,
    globalThemeRefresh,
    adjustTheme,
    colorSchemaStyleOptions,
    darkColorSchemaStyleOptions,
    selectThemeOverrides
}