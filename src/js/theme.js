import {darkTheme} from "naive-ui";
import {ref} from "vue";
import {configManager} from "./core";

const theme = utools.isDarkColors()? darkTheme:null;



/**
 *
 * @return { import('naive-ui').GlobalThemeOverrides }
 */
function getThemeOverrides(){
    const gc = configManager.getGlobalColor();
    return {
        Card:{
            boxShadow:`0px 1px 0px rgba(17,17,26,0.05), 0px 0px 4px ${gc}`
        },
        // Switch:{
        //     railColorActive: gc
        // },
        Tooltip:{
            color: utools.isDarkColors()? '#2a2a2c':'#fafafc',
            textColor: utools.isDarkColors()? '#fafafc':'#2a2a2c'
        },
        // Tag:{
        //     colorChecked: gc,
        //     colorCheckedHover: gc,
        //     colorCheckedPressed:gc
        // },
        // Input:{
        //     borderFocus: `1px solid ${gc}`,
        //     boxShadowFocus: `0 0 5px 0px ${gc}`,
        //     borderHover: `1px solid ${gc}`
        // },
        // Select:{
        //     peers:{
        //         InternalSelection:{
        //             textColor: gc,
        //             borderFocus: `1px solid ${gc}`,
        //             borderActive: `1px solid ${gc}`,
        //             boxShadowActive: `0 0 5px 0px ${gc}`,
        //             boxShadowFocus: `0 0 5px 0px ${gc}`,
        //             borderHover: `1px solid ${gc}`
        //         },
        //         InternalSelectMenu:{
        //             optionCheckColor: gc,
        //             optionTextColorActive: gc,
        //             optionTextColorPressed: gc
        //         }
        //     }
        // },
        // Button:{
        //     borderHover: `1px solid ${gc}`,
        //     borderFocus: `1px solid ${gc}`,
        //     borderPressed: `1px solid ${gc}`,
        //     textColorPressed: utools.isDarkColors()? 'white': 'black',
        //     textColorHover: gc,
        //     textColorFocus: gc
        // },
        // Radio:{
        //     dotColorActive: gc,
        //     boxShadowFocus: `inset 0 0 0 1px ${gc}`,
        //     boxShadowActive: `inset 0 0 0 1px ${gc}`,
        //     boxShadowHover: `inset 0 0 0 1px ${gc}`,
        // },
        // DynamicTags:{
        //     peers:{
        //         Button:{
        //             color: 'red',
        //             colorHover: 'red',
        //             colorFocus: 'red'
        //         }
        //     }
        // }
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
    },
    {
        globalColor: '#36cfc9ff',
        selectedColor: '#e6fffbff',
        tagColor: '#10d5d5ff',
    },
    {
        globalColor: '#40a9ffff',
        selectedColor: '#e6f2ffff',
        tagColor: '#1375d8ff'
    },{
        globalColor: '#b37febff',
        selectedColor: '#f9f0ffff',
        tagColor: '#6a1fc7ff'
    },{
        globalColor: '#ff85c0ff',
        selectedColor: '#fff0f6ff',
        tagColor: '#d41678ff'
    },{
        globalColor: '#f8c76dff',
        selectedColor: '#fffbe6ff',
        tagColor: '#d9950dff'
    },{
        globalColor: '#ff7875ff',
        selectedColor: '#fff1f0ff',
        tagColor: '#d41619ff'
    }];
const darkColorSchemaStyleOptions = [
    {
        globalColor: '#479a6dff',
        selectedColor: '#343c38ff',
        tagColor: '#163c28ff',
    },
    {
        globalColor: '#069898ff',
        selectedColor: '#3a4547ff',
        tagColor: '#0f5252ff',
    },
    {
        globalColor: '#0266caff',
        selectedColor: '#2d3945ff',
        tagColor: '#1f4061ff'
    },{
        globalColor: '#8a63bbff',
        selectedColor: '#3e3747ff',
        tagColor: '#4a3861ff'
    },{
        globalColor: '#aa467aff',
        selectedColor: '#4d3641ff',
        tagColor: '#68314eff'
    },{
        globalColor: '#ffa600ff',
        selectedColor: '#524b3fff',
        tagColor: '#8a610fff'
    },{
        globalColor: '#ff7875ff',
        selectedColor: '#4d3636ff',
        tagColor: '#84393aff'
    }];

function adjustTheme(v){
    let style = utools.isDarkColors()? darkColorSchemaStyleOptions[v]: colorSchemaStyleOptions[v];
    configManager.setGlobalColor(style.globalColor)
    configManager.setColor('TagColor',style.tagColor)
    configManager.setColor('SelectedColor',style.selectedColor)
}


export {
    theme,
    themeOverrides,
    globalThemeRefresh,
    adjustTheme,
    colorSchemaStyleOptions,
    darkColorSchemaStyleOptions
}