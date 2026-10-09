import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

/** 案例資料夾內網站會讀的檔案：zh/en.mdx、meta.json、images/ 底下的圖片與影片 */
const PROJECT_FILE = /[\\/]content[\\/]projects[\\/][^\\/]+[\\/]((zh|en)\.mdx|meta\.json|images([\\/].*)?)$/
const PROJECT_DIR = /[\\/]content[\\/]projects([\\/][^\\/]+)?$/

/** 網站用不到的原始素材（簡報、PDF、影片原檔、壓縮檔、設計原始檔） */
const RAW_ASSET = /\.(pdf|pptx?|key|docx?|xlsx?|psd|ai|fig|sketch|mov|m4v|avi|mkv|zip|rar|7z)$/i

function isIgnored(file: string): boolean {
  if (/[\\/]photo([\\/]|$)/.test(file)) return true
  if (RAW_ASSET.test(file)) return true
  // 案例資料夾最外層放的素材（例如剛拖進去的 png、原始 mp4）不監看，只監看網站真的會讀的檔案
  if (/[\\/]content[\\/]projects[\\/]/.test(file)) return !(PROJECT_FILE.test(file) || PROJECT_DIR.test(file))
  return false
}

/**
 * Windows 上複製大檔案時，檔案會暫時被鎖住（EBUSY / EPERM），檔案監看遇到就會丟錯。
 * 沒有人處理這個錯誤時整個 dev server 會當掉；這裡接住它，只印出警告，檔案複製完成後照常運作。
 */
function tolerateLockedFiles(): Plugin {
  return {
    name: 'tolerate-locked-files',
    configureServer(server) {
      server.watcher.on('error', (error) => {
        const { code, path } = error as NodeJS.ErrnoException
        server.config.logger.warn(`[watch] 暫時無法讀取${path ? ` ${path}` : '檔案'}（${code ?? error}），通常是檔案還在複製中，可忽略。`)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        rehypePlugins: [rehypeSlug],
      }),
    },
    react({ include: /\.(mdx|tsx?|jsx?)$/ }),
    tolerateLockedFiles(),
  ],
  server: {
    watch: { ignored: isIgnored },
  },
})
