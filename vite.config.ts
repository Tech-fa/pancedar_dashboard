import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'

/** public/chat-widget.js is copied as-is; Vite does not replace import.meta.env / process.env there. */
const CHAT_WIDGET_FILE = 'chat-widget.js'
const PH_TEMPLATE_HOST = '__VITE_CHAT_WIDGET_TEMPLATE_HOST__'
const PH_API_URL = '__VITE_API_URL__'

function injectChatWidgetPlaceholders(source: string, env: Record<string, string | undefined>) {
    const host = env.VITE_CHAT_WIDGET_TEMPLATE_HOST ?? ''
    const api = env.VITE_API_URL ?? ''
    return source.replaceAll(PH_TEMPLATE_HOST, host).replaceAll(PH_API_URL, api)
}

function chatWidgetPublicEnvPlugin(): Plugin {
    let outDir = 'dist'
    let root = process.cwd()
    let cachedEnv: Record<string, string | undefined> = {}

    function matchesChatWidgetRequest(url: string | undefined, base: string) {
        if (!url) return false
        const pathname = url.split('?')[0]
        const b = base.endsWith('/') ? base.slice(0, -1) : base
        if (!b || b === '/') return pathname === `/${CHAT_WIDGET_FILE}`
        return pathname === `${b}/${CHAT_WIDGET_FILE}`
    }

    return {
        name: 'chat-widget-env-inject',
        enforce: 'pre',
        configResolved(config) {
            outDir = config.build.outDir
            root = config.root
            cachedEnv = loadEnv(config.mode, config.root, '')
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!matchesChatWidgetRequest(req.url, server.config.base)) {
                    return next()
                }
                const srcPath = path.join(server.config.publicDir, CHAT_WIDGET_FILE)
                try {
                    const raw = await fs.readFile(srcPath, 'utf-8')
                    const env = loadEnv(server.config.mode, server.config.root, '')
                    const body = injectChatWidgetPlaceholders(raw, env)
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
                    res.end(body)
                } catch {
                    next()
                }
            })
        },
        async closeBundle() {
            const outFile = path.resolve(root, outDir, CHAT_WIDGET_FILE)
            try {
                const raw = await fs.readFile(outFile, 'utf-8')
                await fs.writeFile(outFile, injectChatWidgetPlaceholders(raw, cachedEnv), 'utf-8')
            } catch {
                // Widget optional or path differs
            }
        }
    }
}

const htmlPlugin = (config: any) => {
    return {
        name: 'html-transform',
        transformIndexHtml(html: any) {
            // Transform the Vite client script path
            const clientScriptTag = `<script type="module" src="/@vite/client"></script>`
            const newClientScriptTag = `<script type="module" src="${config.base}@vite/client"></script>`
            html = html.replace(clientScriptTag, newClientScriptTag)

            // Transform the main application entry script path
            const mainScriptTag = `<script type="module" src="/src/main.ts"></script>`
            const newMainScriptTag = `<script type="module" src="${config.base}src/main.ts"></script>`
            html = html.replace(mainScriptTag, newMainScriptTag)

            return html
        }
    }
}
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
    const base = process.env.VITE_BASE || '/'
    return {
        plugins: [
            chatWidgetPublicEnvPlugin(),
            vue(),
            vueJsx(),
            svgLoader(),
            htmlPlugin({ base }) // Pass the base config to the plugin
        ],
        base,
        server: {
            port: +(process.env.VITE_PORT || 3003)
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    }
})
