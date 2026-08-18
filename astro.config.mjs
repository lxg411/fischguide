// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ⚠️ 克隆建站后**必须**把兜底值改成本站正式域名（连同 src/config/site.ts 一起改）。
// 它决定 canonical、sitemap、robots.txt 的绝对地址。
//
// 2026-07-25 教训：原兜底是 https://example.com——一个看起来合法、构建不报错、
// 但会让整站 canonical 指向别人域名的值。第三站首次部署漏加 Vercel 环境变量后中招。
// 现在兜底值是明显错误的占位符，忘了改会在构建产物里一眼看见。
const site = process.env.SITE_URL || 'https://fischguide.wiki';

// ===== sitemap <lastmod>（2026-08-18 自 AnvilWiki 移植思路，取真实数据变更日）=====
// lastmod 是谷歌明说唯一信任的 sitemap 字段（影响抓取调度）。取值口径：
//   - 数据页型 ← 对应 src/data/*.json 的 git 最后提交时间（信任层纪律：有真实变化才
//     commit/push，因此 git 日期=真实内容更新日；未入库时退回文件 mtime）
//   - 攻略内页 ← frontmatter updatedDate ?? pubDate
//   - /guides/ 列表页 ← 最新一篇攻略的日期；首页 ← 全站最大值
// 故意不给 lastmod 的页面（about/privacy 等）保持无字段，胜过撒谎的全站同一时间戳。

/** 数据页型 → 数据来源文件（页面停用时该路由不会出现在 sitemap，多映射无害） */
const DATA_PAGE_SOURCES = {
  '/codes/': 'src/data/codes.json',
  '/tier-list/': 'src/data/tier-list.json',
  '/best-weapons/': 'src/data/weapons-tier-list.json',
  '/server-status/': 'src/data/server-status.json',
  '/player-count/': 'src/data/player-stats.json',
  '/release-date/': 'src/data/roadmap.json',
  '/roadmap/': 'src/data/roadmap.json',
  '/system-requirements/': 'src/data/system-requirements.json',
  '/review/': 'src/data/review.json',
  '/faq/': 'src/data/faq.json',
};

/** git 最后提交时间（ISO），未入库/无 git 时退回 mtime，再不行返回 null */
function lastChangedIso(relPath) {
  const abs = path.resolve(relPath);
  if (!fs.existsSync(abs)) return null;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return new Date(out).toISOString();
  } catch {
    /* 无 git 历史，落到 mtime */
  }
  try {
    return fs.statSync(abs).mtime.toISOString();
  } catch {
    return null;
  }
}

function buildLastmodMap() {
  /** @type {Map<string, string>} */
  const map = new Map();

  for (const [route, src] of Object.entries(DATA_PAGE_SOURCES)) {
    const iso = lastChangedIso(src);
    if (iso) map.set(route, iso);
  }

  // 攻略内页：frontmatter updatedDate ?? pubDate（astro:content 在 config 阶段不可用，fs 扫）
  const guidesDir = path.resolve('./src/content/guides');
  if (fs.existsSync(guidesDir)) {
    for (const entry of fs.readdirSync(guidesDir)) {
      if (!entry.endsWith('.md')) continue;
      const fm = fs.readFileSync(path.join(guidesDir, entry), 'utf8').split('---')[1] ?? '';
      const updated = fm.match(/^updatedDate:\s*(.+)$/m)?.[1]?.trim();
      const pub = fm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim();
      const raw = (updated || pub || '').replace(/['"]/g, '');
      if (!raw) continue;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) continue;
      const iso = date.toISOString();
      map.set(`/guides/${entry.replace(/\.md$/, '')}/`, iso);
      const listPrev = map.get('/guides/');
      if (!listPrev || listPrev < iso) map.set('/guides/', iso);
    }
  }

  // 首页 = 全站最新（首页聚合各数据文件，任何数据更新都体现在首页）
  let newest = '';
  for (const iso of map.values()) if (iso > newest) newest = iso;
  if (newest) map.set('/', newest);

  return map;
}

const lastmodMap = buildLastmodMap();

export default defineConfig({
  site,
  // hover 即预取内链（IntersectionObserver 小脚本换页面秒开，Lighthouse 不掉分）
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      serialize(item) {
        try {
          // 统一带尾斜杠后查表（构建为 directory 格式，URL 天然带 /）
          let p = decodeURIComponent(new URL(item.url).pathname);
          if (!p.endsWith('/')) p += '/';
          const lm = lastmodMap.get(p);
          if (lm) item.lastmod = lm;
        } catch {
          /* 非常规条目保持原样 */
        }
        return item;
      },
    }),
  ],
});
