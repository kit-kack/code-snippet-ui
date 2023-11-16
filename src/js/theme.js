import {darkTheme} from "naive-ui";
import {ref} from "vue";
import {configManager} from "./core/config";
import {refreshListView} from "./store";

const theme = utools.isDarkColors()? darkTheme:null;



/**
 *
 * @return { import('naive-ui').GlobalThemeOverrides }
 */
function getThemeOverrides(){
    configManager.init();
    const gc = configManager.getGlobalColor();
    const borderHover = `1px solid ${utools.isDarkColors()? '#737475':'#aaa'}`
    const border = `1px solid ${gc}`
    const textOrCaretColorVar =  utools.isDarkColors()? 'white': '#4b4e51';
    const inputBorderVar =  `1px solid ${utools.isDarkColors()? '#303133': '#e0e0e6'}`;

    const lightBoxShadowFoucsAndActive = `0 2px 9px 0 rgba(100,100,111,.2)`
    const borderFoucs =  `1px solid ${utools.isDarkColors()? '#737475':'#aaa'}`

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
                    borderHover: borderHover,
                    borderFocus: borderHover,
                    borderActive: borderHover,
                    boxShadowFocus: utools.isDarkColors()? 'none': lightBoxShadowFoucsAndActive,
                    boxShadowActive: utools.isDarkColors()? 'none': lightBoxShadowFoucsAndActive,
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
            textColorFocus: gc
        },
        Tabs:{
            tabTextColorHoverLine: gc,
            tabTextColorActiveLine: gc,
            tabTextColorActiveBar: gc,
            tabTextColorHoverBar: gc,
            barColor: gc
        },
        DynamicTags:{
            peers:{
                Tag:{
                    textColor: gc
                }
            }
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
    // {
    //     globalColor: '#36cfc9ff',
    //     selectedColor: '#e6fffbff',
    //     tagColor: '#10d5d5ff',
    //     highColor: '#cbf3f199'
    // },
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
    }
    ,{
        globalColor: '#fdb83aff',
        selectedColor: '#fffbe6ff',
        tagColor: '#d9950dff',
        highColor: '#f6e6c8aa'
    }
    // , {
    //     globalColor: '#ff7875ff',
    //     selectedColor: '#fff1f0ff',
    //     tagColor: '#d41619ff',
    //     highColor: '#fcd0cfaa'
    // }
    ];
const darkColorSchemaStyleOptions = [
    {
        globalColor: '#5ccb8fff',
        selectedColor: '#343c38ff',
        tagColor: '#1e5237ff',
        highColor: '#1A49319E'
    },
    // {
    //     globalColor: '#069898ff',
    //     selectedColor: '#3a4547ff',
    //     tagColor: '#0f5252ff',
    //     highColor: '#154D4DAA'
    // },
    {
        globalColor: '#90caf9ff',
        selectedColor: '#2d3945ff',
        tagColor: '#076DBFFF',
        highColor: '#90caf955'
    },{
        globalColor: '#9f72d7ff',
        selectedColor: '#3e3747ff',
        tagColor: '#4a3861ff',
        highColor: '#4a386155'
    },{
        globalColor: '#d25696ff',
        selectedColor: '#4d3641ff',
        tagColor: '#68314eff',
        highColor: '#562940AF'
    }
    ,{
        globalColor: '#f2c55cff',
        selectedColor: '#524b3fff',
        tagColor: '#8a610fff',
        highColor: '#EC9E0721'
    }
    // ,{
    //     globalColor: '#ff7875ff',
    //     selectedColor: '#4d3636ff',
    //     tagColor: '#84393aff',
    //     highColor: '#FF78753D'
    // }
    ];

function initTheme(){
    let flag = false;
    if(configManager.get('darkHighlightColor') === undefined){
        configManager.configs["darkHighlightColor"] = darkColorSchemaStyleOptions[0].highColor
        configManager.configs["lightHighlightColor"]  = colorSchemaStyleOptions[0].highColor;
        configManager.writeToDB()
        flag = true;
    }
    if(configManager.get("colorSchema") === undefined){
        configManager.configs["colorSchema"] = 0
        configManager.configs["darkColorSchema"] = 0
        configManager.configs["lightGlobalColor"] = colorSchemaStyleOptions[0].globalColor
        configManager.configs["darkGlobalColor"] = darkColorSchemaStyleOptions[0].globalColor
        configManager.configs["lightTagColor"] = colorSchemaStyleOptions[0].tagColor
        configManager.configs["darkTagColor"] = darkColorSchemaStyleOptions[0].tagColor
        configManager.configs["lightSelectedColor"] = colorSchemaStyleOptions[0].selectedColor
        configManager.configs["darkSelectedColor"] = darkColorSchemaStyleOptions[0].selectedColor
        configManager.writeToDB()
        flag = true;
    }
    if(flag){
        globalThemeRefresh()
        refreshListView();
    }
}

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
    initTheme,
    colorSchemaStyleOptions,
    darkColorSchemaStyleOptions
}