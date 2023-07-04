import {darkTheme} from "naive-ui";
import {ref} from "vue";
import {configManager} from "./core";

const theme = utools.isDarkColors()? darkTheme:null;



/**
 *
 * @return { import('naive-ui').GlobalThemeOverrides }
 */
function getThemeOverrides(){
    configManager.init();
    const gc = configManager.getGlobalColor();
    const borderVar = `1px solid ${gc}`
    const boxShadowVar = `inset 0 0 0 1px ${gc}`
    const textOrCaretColorVar =  utools.isDarkColors()? 'white': '#4b4e51';
    const inputBorderVar = utools.isDarkColors()? 'none': '1px solid #ddd';


    return {
        Switch:{
            railColorActive: gc
        },
        Tooltip:{
            color: utools.isDarkColors()? '#2a2a2c':'#fafafc',
            textColor: utools.isDarkColors()? '#fafafc':'#2a2a2c'
        },
        Tag:{
            colorChecked: gc,
            colorCheckedHover: gc,
            colorCheckedPressed:gc
        },
        Input:{
            borderFocus: utools.isDarkColors()? 'none': borderVar,
            boxShadowFocus: `0px 1px 0px rgba(17,17,26,0.05), 0px 0px 2px ${gc} inset, 0 0 3px ${gc}`,
            borderHover: utools.isDarkColors()? 'none': borderVar,
            border: inputBorderVar,
            caretColor: textOrCaretColorVar,
        },
        Select:{
            peers:{
                InternalSelection:{
                    textColor: textOrCaretColorVar,
                    borderFocus: 'none',
                    boxShadowFocus: 'none',
                    borderHover: 'none',
                    border: inputBorderVar,
                    borderActive: 'none',
                    boxShadowActive: 'none',
                    caretColor: textOrCaretColorVar,
                    colorFocus: 'white',
                    colorActive: utools.isDarkColors()? '#575859': '#fff'
                },
                InternalSelectMenu:{
                    optionCheckColor: gc,
                    optionTextColorActive: gc,
                    optionTextColorPressed: gc
                }
            }
        },
        Button:{
            borderHover: borderVar,
            borderFocus: borderVar,
            borderPressed: borderVar,
            textColorPressed: utools.isDarkColors()? 'white': 'black',
            textColorHover: gc,
            textColorFocus: gc
        },
        Radio:{
            dotColorActive: gc,
            boxShadowFocus: boxShadowVar,
            boxShadowActive: boxShadowVar,
            boxShadowHover: boxShadowVar,
        }
    }
}



const themeOverrides = ref(getThemeOverrides())
const globalThemeRefresh = ()=>{
    themeOverrides.value = getThemeOverrides()
}

const colorSchemaStyleOptions = [
    {
        globalColor: '#65b88cff',
        selectedColor: '#f9fff5ff',
        tagColor: '#18a057ff',
        highColor: '#d1f8e3aa'
    },
    {
        globalColor: '#36cfc9ff',
        selectedColor: '#e6fffbff',
        tagColor: '#10d5d5ff',
        highColor: '#cbf3f199'
    },
    {
        globalColor: '#40a9ffff',
        selectedColor: '#e6f2ffff',
        tagColor: '#1375d8ff',
        highColor: '#bbd9f1bb'
    },{
        globalColor: '#b37febff',
        selectedColor: '#f9f0ffff',
        tagColor: '#6a1fc7ff',
        highColor: '#E8D9F8AA'
    },{
        globalColor: '#ff85c0ff',
        selectedColor: '#fff0f6ff',
        tagColor: '#d41678ff',
        highColor: '#fdd8eaaa'
    },{
        globalColor: '#f8c76dff',
        selectedColor: '#fffbe6ff',
        tagColor: '#d9950dff',
        highColor: '#f6e6c8aa'
    },{
        globalColor: '#ff7875ff',
        selectedColor: '#fff1f0ff',
        tagColor: '#d41619ff',
        highColor: '#fcd0cfaa'
    }];
const darkColorSchemaStyleOptions = [
    {
        globalColor: '#479a6dff',
        selectedColor: '#343c38ff',
        tagColor: '#1e5237ff',
        highColor: '#1A49319E'
    },
    {
        globalColor: '#069898ff',
        selectedColor: '#3a4547ff',
        tagColor: '#0f5252ff',
        highColor: '#154D4DAA'
    },
    {
        globalColor: '#0266caff',
        selectedColor: '#2d3945ff',
        tagColor: '#1f4061ff',
        highColor: '#0241855B'
    },{
        globalColor: '#8a63bbff',
        selectedColor: '#3e3747ff',
        tagColor: '#4a3861ff',
        highColor: '#4D2E738E'
    },{
        globalColor: '#aa467aff',
        selectedColor: '#4d3641ff',
        tagColor: '#68314eff',
        highColor: '#562940AF'
    },{
        globalColor: '#ffa600ff',
        selectedColor: '#524b3fff',
        tagColor: '#8a610fff',
        highColor: '#EC9E0721'
    },{
        globalColor: '#ff7875ff',
        selectedColor: '#4d3636ff',
        tagColor: '#84393aff',
        highColor: '#FF78753D'
    }];

function adjustTheme(v){
    let style = utools.isDarkColors()? darkColorSchemaStyleOptions[v]: colorSchemaStyleOptions[v];
    configManager.setGlobalColor(style.globalColor)
    configManager.setColor('TagColor',style.tagColor)
    configManager.setColor('SelectedColor',style.selectedColor)
    configManager.setColor('HighlightColor',style.highColor)
}


export {
    theme,
    themeOverrides,
    globalThemeRefresh,
    adjustTheme,
    colorSchemaStyleOptions,
    darkColorSchemaStyleOptions
}