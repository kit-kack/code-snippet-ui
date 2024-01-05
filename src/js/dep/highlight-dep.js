import hljs from "highlight.js/lib/core";
// 基于语雀，选取的常用编程语言列表如下
// a:
// b: bash basic(X)
import bash from 'highlight.js/lib/languages/bash'
// import basic from 'highlight.js/lib/languages/basic'
// c: c c# c++  Clojure CMake CSS
import c from 'highlight.js/lib/languages/c'
import csharp from 'highlight.js/lib/languages/csharp'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
// import clojure from 'highlight.js/lib/languages/clojure'
// import cmake from 'highlight.js/lib/languages/cmake'
// d: dart diff dockerfile
import dart from 'highlight.js/lib/languages/dart'
// import dockerfile from 'highlight.js/lib/languages/dockerfile'
// e: erlang
import erlang from 'highlight.js/lib/languages/erlang'
// f: f# fortan
import fsharp from 'highlight.js/lib/languages/fsharp'
// import fortan from 'highlight.js/lib/languages/fortran'
// g: go graphql groovy
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import groovy from 'highlight.js/lib/languages/groovy'
// h: haskell html http
// import haskell from 'highlight.js/lib/languages/haskell'
import http from 'highlight.js/lib/languages/http'
// i: ini
import ini from 'highlight.js/lib/languages/ini'
// j: java javascript json julia
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
// import julia from 'highlight.js/lib/languages/julia'
// k: kotlin
import kotlin from 'highlight.js/lib/languages/kotlin'
// l: lateX less lisp lua
import latex from 'highlight.js/lib/languages/latex'
import less from 'highlight.js/lib/languages/less'
// import lisp from 'highlight.js/lib/languages/lisp'
import lua from 'highlight.js/lib/languages/lua'
// m: markfile markdown matlab
import markdown from 'highlight.js/lib/languages/markdown'
// import matlab from 'highlight.js/lib/languages/matlab'
// n: nginx
// import nginx from 'highlight.js/lib/languages/nginx'
// o: object-c ocaml
import objectivec from 'highlight.js/lib/languages/objectivec'
// import ocaml from 'highlight.js/lib/languages/ocaml'
// p: php powershell properties protobuf python plaintext
import php from 'highlight.js/lib/languages/php'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import powershell from 'highlight.js/lib/languages/powershell'
import properties from 'highlight.js/lib/languages/properties'
import protobuf from 'highlight.js/lib/languages/protobuf'
// q:
// r: r ruby rust
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
// s: scala schema shell sql swift
import scala from 'highlight.js/lib/languages/scala'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
// t: tcl typescript
// import tcl from 'highlight.js/lib/languages/tcl'
import typescript from 'highlight.js/lib/languages/typescript'
// u
// v: vbnet  verilog vue
// import verilog from 'highlight.js/lib/languages/verilog'
// w: wasm
import wasm from 'highlight.js/lib/languages/wasm'
// x: xml
import xml from 'highlight.js/lib/languages/xml'
// y: yaml
import yaml from 'highlight.js/lib/languages/yaml'
// z
const languages = {
    "bash": bash,
    "c": c,
    "csharp": csharp,
    "cpp": cpp,
    "css": css,
    "dart": dart,
    "erlang": erlang,
    "fsharp": fsharp,
    "go": go,
    "graphql": graphql,
    "groovy": groovy,
    "http": http,
    "ini": ini,
    "java": java,
    "javascript": javascript,
    "json": json,
    "kotlin": kotlin,
    "latex": latex,
    "less": less,
    "lua": lua,
    "markdown": markdown,
    "objectivec": objectivec,
    "php": php,
    "plaintext": plaintext,
    "python": python,
    "powershell": powershell,
    "properties": properties,
    "protobuf": protobuf,
    "r": r,
    "ruby": ruby,
    "rust": rust,
    "scala": scala,
    "shell": shell,
    "sql": sql,
    "swift": swift,
    "typescript": typescript,
    "wasm": wasm,
    "xml": xml,
    "yaml": yaml
}
//
for (const lang in languages){
    hljs.registerLanguage(lang,languages[lang])
}
// alias
hljs.registerAliases(["vue","html"],{languageName:"xml"})


export default hljs;