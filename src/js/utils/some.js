import hljs from "highlight.js";

let rootLanguages = hljs.listLanguages();
rootLanguages.push("vue","html")
rootLanguages = rootLanguages.sort()
let languages = rootLanguages.map(v=>{
    if(v === "plaintext"){
        return {
            label: "plaintext - 纯文本",
            value: "plaintext"
        }
    }
    return {
        label:v,
        value:v
    }
});


const isSupportedLanguage = (languageName)=>{
    if(languageName==null){
        return false;
    }
    return rootLanguages.includes(languageName)
}





export {
    languages,
    isSupportedLanguage
}