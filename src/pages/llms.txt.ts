import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';

/**
 * /llms.txt — 给 AI 搜索（ChatGPT/Perplexity/Claude/AI Overviews 爬虫）的
 * Markdown 站点地图（Jeremy Howard 提出的社区标准）。
 * 游戏攻略类查询（"how to beat X" / "latest codes"）越来越多落在 AI 聊天入口，
 * 列出全站页面零成本，帮 AI 爬虫发现并引用本站。（2026-08-18 自 AnvilWiki 移植）
 *
 * 构建时自动生成：页型部分用 import.meta.glob 枚举 src/pages/ 里启用的页面
 * （下划线停用的页型自动消失，与页型开关约定天然一致），攻略部分读 guides 集合。
 */

// 页型 → 一句话说明（llms.txt 的引用锚点；未列出的启用页面用兜底文案）
const PAGE_DESC: Record<string, string> = {
  '/': `${SITE.gameName} guide hub: tier lists, codes, server status, player stats and beginner guides.`,
  '/codes/': `Working ${SITE.gameName} codes, verified and updated regularly.`,
  '/tier-list/': `${SITE.gameName} tier list with S/A/B rankings.`,
  '/best-weapons/': `Best weapons in ${SITE.gameName}, ranked with locations.`,
  '/server-status/': `Is ${SITE.gameName} down? Live server status and login fixes.`,
  '/player-count/': `${SITE.gameName} player count, 24h peak and 7-day trend.`,
  '/release-date/': `${SITE.gameName} release date, platforms and roadmap.`,
  '/system-requirements/': `${SITE.gameName} minimum and recommended PC specs.`,
  '/review/': `Is ${SITE.gameName} worth it? Honest review with pros and cons.`,
  '/roadmap/': `${SITE.gameName} roadmap: upcoming updates and content.`,
  '/faq/': `Frequently asked questions about ${SITE.gameName}.`,
  '/guides/': `All ${SITE.gameName} guides, one per topic.`,
};

// 信任页对 AI 引用无价值，不进清单
const EXCLUDE = new Set(['/about/', '/privacy/', '/contact/', '/404/']);

export const GET: APIRoute = async ({ site: siteBase }) => {
  // 枚举启用页型（_ 前缀停用的文件不会被 glob 到该路由：文件名带 _ 直接过滤）
  const pageFiles = import.meta.glob('./*.astro');
  const routes = Object.keys(pageFiles)
    .map((f) => f.replace('./', '').replace('.astro', ''))
    .filter((name) => !name.startsWith('_') && name !== '404')
    .map((name) => (name === 'index' ? '/' : `/${name}/`))
    .filter((route) => !EXCLUDE.has(route));
  // guides 有子目录索引页，glob 扫不到，手动补
  routes.push('/guides/');
  // 按 PAGE_DESC 的声明顺序输出（首页在前），未知路由排最后
  const order = Object.keys(PAGE_DESC);
  routes.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const site = (siteBase?.href ?? '').replace(/\/$/, '');

  const g = SITE.game;
  const lines: string[] = [
    `# ${SITE.siteName}`,
    '',
    `> ${SITE.description}`,
    '',
    `Fan guide site for ${SITE.gameName} (${g.genre}, ${g.platforms}, by ${g.developer}). Covers codes, tier lists, server status, player stats and gameplay guides.`,
    '',
    '## Pages',
    '',
  ];

  const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  for (const route of [...new Set(routes)]) {
    const label =
      route === '/'
        ? `${SITE.gameName} Guide`
        : route === '/codes/'
          ? `${SITE.gameName} Codes (${month})`
          : route
              .replace(/[/-]/g, ' ')
              .trim()
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .replace(/^Faq$/, 'FAQ');
    const desc = PAGE_DESC[route] ?? `${SITE.gameName} ${label.toLowerCase()}.`;
    lines.push(`- [${label}](${site}${route}): ${desc}`);
  }

  const guides = await getCollection('guides');
  if (guides.length > 0) {
    lines.push('', '## Guides', '');
    for (const guide of guides) {
      lines.push(`- [${guide.data.title}](${site}/guides/${guide.id}/): ${guide.data.description}`);
    }
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
