

/**
 * @type Editor
 */
export const JETBRAINS_EDITOR = {

    update(dir, name, code, desc) {
        let xml;
        const path = window.preload.getFinalPath(dir,'./utools-code-snippet.xml');
        try{
            xml = window.preload.readFile(path).toString()
        }catch (_){}
        if(xml){
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml,'text/xml')
            const element = xmlDoc.querySelector(`template[name="${name}"]`)
            if(element){
                element.setAttribute('value',code)
                element.setAttribute('description',desc ?? name)
            }else{
                const template = xmlDoc.createElement('template')
                template.setAttribute('name',name)
                template.setAttribute('value',code)
                template.setAttribute('description',desc ?? name)
                template.setAttribute('toReformat',"false")
                template.setAttribute('toShortenFQNames',"true")
                // <option name="OTHER" value="true" />
                const option = xmlDoc.createElement('option')
                option.setAttribute('name','OTHER')
                option.setAttribute('value',"true")
                // <content> ... </content>
                const context = xmlDoc.createElement('context')
                context.append(xmlDoc.createTextNode('\n\t\t\t'))
                context.appendChild(option)
                context.append(xmlDoc.createTextNode('\n\t\t'))
                // <template> ... </template>
                template.append(xmlDoc.createTextNode('\n\t\t'))
                template.appendChild(context)
                template.append(xmlDoc.createTextNode('\n\t'))
                const templateSet = xmlDoc.children[0]
                templateSet.append(xmlDoc.createTextNode('\t'))
                templateSet.append(template)
                templateSet.append(xmlDoc.createTextNode('\n'))
            }
            // serialize
            const serialize = new XMLSerializer();
            xml = serialize.serializeToString(xmlDoc)
        }else{
            xml = `\
<templateSet group="utools-code-snippet">
    <template name="${name}" value="${code}" description="${desc ?? name}" toReformat="false" toShortenFQNames="true">
        <context>
            <option name="OTHER" value="true" />
        </context>
    </template>
</templateSet>`
        }

        window.preload.writeConfigFile(dir,'./utools-code-snippet.xml',xml)

    },
    remove(dir, name) {
        const path = window.preload.getFinalPath(dir,'./utools-code-snippet.xml');
        let xml;
        try{
            xml = window.preload.readFile(path).toString()
        }catch (_){}
        if(!xml){
            return
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml,'text/xml')
        const element = xmlDoc.querySelector(`template[name="${name}"]`)
        if(element){
            const prev = element.previousSibling;
            if(prev && prev.nodeType === 3){
                prev.remove();
            }
            element.remove()

            // serialize
            const serialize = new XMLSerializer();
            xml = serialize.serializeToString(xmlDoc)
            window.preload.writeConfigFile(dir,'./utools-code-snippet.xml',xml)
        }

    }
}