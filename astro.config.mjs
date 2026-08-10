// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ⚠️ 克隆建站后**必须**把兜底值改成本站正式域名（连同 src/config/site.ts 一起改）。
// 它决定 canonical、sitemap、robots.txt 的绝对地址。
//
// 2026-07-25 教训：原兜底是 https://example.com——一个看起来合法、构建不报错、
// 但会让整站 canonical 指向别人域名的值。第三站首次部署漏加 Vercel 环境变量后中招。
// 现在兜底值是明显错误的占位符，忘了改会在构建产物里一眼看见。
const site = process.env.SITE_URL || 'https://fischguide.wiki';

export default defineConfig({
  site,
  integrations: [sitemap()],
});
