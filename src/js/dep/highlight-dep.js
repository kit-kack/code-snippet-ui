import hljs from "highlight.js/lib/common";
// a:
// b: bash basic
import basic from 'highlight.js/lib/languages/basic'
// c: c c# c++  Clojure CMake CSS
import clojure from 'highlight.js/lib/languages/clojure'
import cmake from 'highlight.js/lib/languages/cmake'
// d: dart diff dockerfile
import dart from 'highlight.js/lib/languages/dart'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
// e: erlang
import erlang from 'highlight.js/lib/languages/erlang'
// f: f# fortan
import fsharp from 'highlight.js/lib/languages/fsharp'
import fortan from 'highlight.js/lib/languages/fortran'
// g: go graphql groovy
import groovy from 'highlight.js/lib/languages/groovy'
// h: haskell html http
import haskell from 'highlight.js/lib/languages/haskell'
import http from 'highlight.js/lib/languages/http'
// i: ini
// j: java javascript json julia
import julia from 'highlight.js/lib/languages/julia'
// k: kotlin
// l: lateX less lisp lua
import latex from 'highlight.js/lib/languages/latex'
import lisp from 'highlight.js/lib/languages/lisp'
// m: markfile markdown matlab
import matlab from 'highlight.js/lib/languages/matlab'
// n: nginx
import nginx from 'highlight.js/lib/languages/nginx'
// o: object-c ocaml
import ocaml from 'highlight.js/lib/languages/ocaml'
// p: php powershell properties protobuf python plaintext
import powershell from 'highlight.js/lib/languages/powershell'
import properties from 'highlight.js/lib/languages/properties'
import protobuf from 'highlight.js/lib/languages/protobuf'
// q:
// r: r ruby rust
// s: scala schema shell sql swift
import scala from 'highlight.js/lib/languages/scala'
// t: tcl typescript
import tcl from 'highlight.js/lib/languages/tcl'
// u
// v: vbnet  verilog vue
import verilog from 'highlight.js/lib/languages/verilog'
// w: wasm
// x: xml
// y: yaml
// z
const languages = {
    "basic": basic,
    "clojure": clojure,
    "cmake": cmake,
    "dart": dart,
    "dockerfile": dockerfile,
    "erlang": erlang,
    "fsharp": fsharp,
    "fortran": fortan,
    "groovy": groovy,
    "haskell": haskell,
    "http": http,
    "julia": julia,
    "latex": latex,
    "lisp": lisp,
    "matlab": matlab,
    "nginx": nginx,
    "ocaml": ocaml,
    "powershell": powershell,
    "properties": properties,
    "protobuf": protobuf,
    "scala": scala,
    "tcl": tcl,
    "verilog": verilog
}

for (const lang in languages){
    hljs.registerLanguage(lang,languages[lang])
}
// alias
hljs.registerAliases(["vue"],{languageName:"xml"})


export default hljs;