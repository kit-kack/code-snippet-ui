import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {createPreloadPlugin} from "vite-plugin-utools-helper";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
    base:"./",
    server:{
      port: 3100
    },
    define:{
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    plugins: [
      vue(),
      svgLoader(),
      createPreloadPlugin({
        name:'window.preload',
        path:'src/preload/index.js'
      }),
        // createUpxPlugin(({
        //     outFileName:'code-snippet-[version].upx'
        // }))
    ],
})
