import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {createPreloadPlugin, createUpxPlugin} from "vite-plugin-utools-helper";

// https://vitejs.dev/config/
export default defineConfig({
    base:"./",
    server:{
      port: 3100
    },
    plugins: [
      vue(),
      createPreloadPlugin({
        name:'window.preload',
        path:'src/preload/index.js'
      }),
        createUpxPlugin(({
            outFileName:'one-2.3.0.upx'
        }))
    ],
})
